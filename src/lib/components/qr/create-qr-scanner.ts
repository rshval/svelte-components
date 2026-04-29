import { Capacitor } from '@capacitor/core';
import { get, writable } from 'svelte/store';
import { parseQrPayload } from './parse-qr-payload.js';
import type {
	CreateQrScannerOptions,
	ParsedQrPayload,
	QrScannerError,
	QrScannerFormat,
	QrScannerMode,
	QrScannerPermission
} from './types.js';

type NativeScanPlugin = {
	checkPermissions?: () => Promise<{ camera?: string }>;
	requestPermissions?: () => Promise<{ camera?: string }>;
	addListener?: (
		eventName: 'barcodeScanned',
		listener: (event: {
			barcode?: { rawValue?: string; displayValue?: string };
			rawValue?: string;
		}) => void
	) => Promise<{ remove: () => Promise<void> }>;
	startScan?: (options?: { formats?: string[] }) => Promise<unknown>;
	stopScan?: () => Promise<unknown>;
};

export function createQrScanner(options: CreateQrScannerOptions = {}) {
	const isRunning = writable(false);
	const isPaused = writable(false);
	const permission = writable<QrScannerPermission>('unknown');
	const mode = writable<QrScannerMode>(Capacitor.isNativePlatform() ? 'capacitor' : 'web');
	const error = writable<QrScannerError | null>(null);
	const lastPayload = writable<ParsedQrPayload | null>(null);

	const cooldownMs = options.cooldownMs ?? 2000;
	const formats = options.formats ?? ['qr_code'];
	const dedupeMap = new Map<string, number>();

	let videoElement: HTMLVideoElement | null = null;
	let stream: MediaStream | null = null;
	let detector: BarcodeDetector | null = null;
	let fallbackReader: { stop: () => void } | null = null;
	let animationFrame = 0;
	let nativeListener: { remove: () => Promise<void> } | null = null;
	let nativePlugin: NativeScanPlugin | null = null;

	function attachVideo(element: HTMLVideoElement | null) {
		videoElement = element;
	}

	async function start() {
		if (get(isRunning)) return;
		error.set(null);
		isPaused.set(false);
		isRunning.set(true);
		try {
			if (get(mode) === 'capacitor') {
				await startNative();
			} else {
				await startWeb();
			}
		} catch (cause) {
			handleError({
				code: 'scanner-failed',
				message: 'Scanner failed to start.',
				cause
			});
			isRunning.set(false);
		}
	}

	async function stop() {
		if (get(mode) === 'capacitor') {
			await stopNative();
		} else {
			stopWeb();
		}
		isRunning.set(false);
		isPaused.set(false);
	}

	function pause() {
		isPaused.set(true);
	}

	function resume() {
		if (get(isRunning)) {
			isPaused.set(false);
		}
	}

	async function checkPermission() {
		if (get(mode) === 'capacitor') {
			nativePlugin = nativePlugin ?? (await loadNativePlugin());
			if (!nativePlugin?.checkPermissions) {
				permission.set('unknown');
				return 'unknown' as const;
			}
			const result = await nativePlugin.checkPermissions();
			const normalized = mapPermission(result.camera);
			permission.set(normalized);
			return normalized;
		}

		if (!navigator.mediaDevices?.getUserMedia) {
			handleError({
				code: 'camera-unavailable',
				message: 'Camera API is not available in this environment.'
			});
			return 'restricted' as const;
		}

		if (navigator.permissions?.query) {
			const cameraPermission = await navigator.permissions.query({
				name: 'camera' as PermissionName
			});
			const normalized = mapPermission(cameraPermission.state);
			permission.set(normalized);
			return normalized;
		}

		permission.set('prompt');
		return 'prompt' as const;
	}

	async function requestPermission() {
		if (get(mode) === 'capacitor') {
			nativePlugin = nativePlugin ?? (await loadNativePlugin());
			if (!nativePlugin?.requestPermissions) {
				permission.set('unknown');
				return 'unknown' as const;
			}
			const result = await nativePlugin.requestPermissions();
			const normalized = mapPermission(result.camera);
			permission.set(normalized);
			return normalized;
		}

		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
			mediaStream.getTracks().forEach((track) => track.stop());
			permission.set('granted');
			return 'granted' as const;
		} catch (err) {
			const normalized = mapDomException(err);
			permission.set(normalized);
			return normalized;
		}
	}

	async function startWeb() {
		const currentPermission = await checkPermission();
		const finalPermission =
			currentPermission === 'prompt' ? await requestPermission() : currentPermission;

		if (finalPermission !== 'granted') {
			throwPermissionError(finalPermission);
			throw new Error('Permission was not granted');
		}

		if (!videoElement) {
			handleError({
				code: 'camera-unavailable',
				message: 'Scanner cannot start without a bound video element.'
			});
			return;
		}

		stream = await navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: 'environment'
			}
		});

		videoElement.srcObject = stream;
		await videoElement.play();

		if ('BarcodeDetector' in window) {
			detector = new BarcodeDetector({ formats: normalizeWebFormats(formats) });
			loopDetectWithBarcodeDetector();
			return;
		}

		await startZxingFallback();
	}

	function stopWeb() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		}

		detector = null;
		fallbackReader?.stop();
		fallbackReader = null;

		if (videoElement) {
			videoElement.pause();
			videoElement.srcObject = null;
		}

		stream?.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	async function startNative() {
		nativePlugin = nativePlugin ?? (await loadNativePlugin());
		if (!nativePlugin) {
			handleError({
				code: 'scanner-not-installed',
				message: 'Install @capacitor-mlkit/barcode-scanning for Capacitor mode.'
			});
			throw new Error('Native scanner plugin is missing');
		}
		const currentPermission = await checkPermission();
		const finalPermission =
			currentPermission === 'prompt' ? await requestPermission() : currentPermission;
		if (finalPermission !== 'granted') {
			throwPermissionError(finalPermission);
			throw new Error('Permission was not granted');
		}

		if (!nativePlugin.startScan) {
			handleError({
				code: 'scanner-not-supported',
				message: 'Native scanner plugin does not expose startScan().'
			});
			return;
		}

		if (nativePlugin.addListener) {
			nativeListener = await nativePlugin.addListener('barcodeScanned', (event) => {
				const rawValue = event.barcode?.rawValue || event.barcode?.displayValue || event.rawValue;
				if (rawValue) {
					handleDetected(rawValue);
				}
			});
		}

		await nativePlugin.startScan({ formats: ['QR_CODE'] });
	}

	async function stopNative() {
		if (nativePlugin?.stopScan) {
			await nativePlugin.stopScan();
		}
		if (nativeListener) {
			await nativeListener.remove();
			nativeListener = null;
		}
	}

	function loopDetectWithBarcodeDetector() {
		const tick = async () => {
			if (!get(isRunning)) return;
			if (!videoElement || !detector) return;

			if (!get(isPaused) && videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
				try {
					const barcodes = await detector.detect(videoElement);
					for (const code of barcodes) {
						if (code.rawValue) {
							handleDetected(code.rawValue);
							break;
						}
					}
				} catch (err) {
					handleError({
						code: 'scanner-failed',
						message: 'BarcodeDetector failed to process current frame.',
						cause: err
					});
				}
			}

			animationFrame = requestAnimationFrame(tick);
		};

		animationFrame = requestAnimationFrame(tick);
	}

	async function startZxingFallback() {
		if (!videoElement) return;
		try {
			const { BrowserMultiFormatReader } = await import('@zxing/browser');
			const reader = new BrowserMultiFormatReader();
			const controls = await reader.decodeFromVideoElement(videoElement, (result, err) => {
				if (result?.getText() && !get(isPaused)) {
					handleDetected(result.getText());
				}
				if (err && String(err).includes('NotFoundException')) {
					return;
				}
			});
			fallbackReader = {
				stop: () => {
					controls.stop();
					reader.reset();
				}
			};
		} catch (err) {
			handleError({
				code: 'scanner-not-supported',
				message: 'Fallback scanner failed to initialize. Install @zxing/browser for web fallback.',
				cause: err
			});
		}
	}

	function handleDetected(rawValue: string) {
		const now = Date.now();
		const lastSeen = dedupeMap.get(rawValue) ?? 0;
		if (now - lastSeen < cooldownMs) {
			return;
		}
		dedupeMap.set(rawValue, now);
		const parsed = parseQrPayload(rawValue, options.baseUrl, options.checkInPath);
		lastPayload.set(parsed);
		notifyFeedback();
		options.onDetect?.(parsed);
	}

	function notifyFeedback() {
		if (options.vibrateOnDetect && navigator.vibrate) {
			navigator.vibrate(60);
		}
		if (options.beepOnDetect && typeof Audio !== 'undefined') {
			const sound = new Audio(
				'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YTAAAAAA'
			);
			sound.play().catch(() => {});
		}
	}

	function throwPermissionError(current: QrScannerPermission) {
		if (current === 'denied') {
			handleError({
				code: 'permission-denied',
				message: 'Camera permission is denied. Enable it in browser or system settings.'
			});
			return;
		}
		if (current === 'restricted') {
			handleError({
				code: 'permission-restricted',
				message: 'Camera access is restricted on this device.'
			});
			return;
		}
		handleError({
			code: 'permission-required',
			message: 'Camera permission is required to start scanning.'
		});
	}

	function handleError(scannerError: QrScannerError) {
		error.set(scannerError);
		options.onError?.(scannerError);
	}

	return {
		mode,
		permission,
		isRunning,
		isPaused,
		error,
		lastPayload,
		attachVideo,
		checkPermission,
		requestPermission,
		start,
		stop,
		pause,
		resume
	};
}

function mapPermission(value?: string): QrScannerPermission {
	if (!value) return 'unknown';
	if (value === 'granted') return 'granted';
	if (value === 'denied') return 'denied';
	if (value === 'prompt') return 'prompt';
	if (value === 'prompt-with-rationale') return 'prompt';
	if (value === 'restricted') return 'restricted';
	return 'unknown';
}

function normalizeWebFormats(formats: QrScannerFormat[]): BarcodeFormat[] {
	return formats
		.map((format) => format.toLowerCase())
		.filter((format): format is BarcodeFormat => format === 'qr_code');
}

function mapDomException(err: unknown): QrScannerPermission {
	if (err instanceof DOMException) {
		if (err.name === 'NotAllowedError') return 'denied';
		if (err.name === 'NotFoundError') return 'restricted';
	}
	return 'unknown';
}

async function loadNativePlugin(): Promise<NativeScanPlugin | null> {
	try {
		const plugin = await import('@capacitor-mlkit/barcode-scanning');
		return (plugin as { BarcodeScanner?: NativeScanPlugin }).BarcodeScanner ?? null;
	} catch {
		return null;
	}
}
