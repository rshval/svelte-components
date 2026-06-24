<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { createQrScanner } from './create-qr-scanner.js';
	import type { ParsedQrPayload, QrScannerError, QrScannerFormat } from './types.js';

	type Props = {
		autoStart?: boolean;
		cooldownMs?: number;
		formats?: QrScannerFormat[];
		url?: string;
		checkInPath?: string;
		highlightFrame?: boolean;
		showScanResult?: boolean;
		scanResultDurationMs?: number;
		isSuccessfulScan?: (payload: ParsedQrPayload) => boolean;
		vibrateOnDetect?: boolean;
		beepOnDetect?: boolean;
		ondetect?: (payload: ParsedQrPayload) => void;
		onerror?: (error: QrScannerError) => void;
		onDetect?: (payload: ParsedQrPayload) => void;
		onError?: (error: QrScannerError) => void;
		class?: string;
	};

	const defaultSuccessfulScan = (payload: ParsedQrPayload) =>
		payload.kind === 'check-in-link' && Boolean(payload.ticketNumber);

	let {
		autoStart = true,
		cooldownMs = 2000,
		formats = ['qr_code'],
		url,
		checkInPath,
		highlightFrame = true,
		showScanResult = true,
		scanResultDurationMs = 1400,
		isSuccessfulScan = defaultSuccessfulScan,
		vibrateOnDetect = true,
		beepOnDetect = false,
		ondetect,
		onerror,
		onDetect,
		onError,
		class: className
	}: Props = $props();

	let videoEl: HTMLVideoElement | null = null;
	let scanResultState = $state<'idle' | 'success' | 'error'>('idle');
	let scanResultTimeout: ReturnType<typeof setTimeout> | null = null;
	const initialCooldownMs = untrack(() => cooldownMs);
	const initialFormats = untrack(() => formats);
	const initialUrl = untrack(() => url);
	const initialCheckInPath = untrack(() => checkInPath);
	const initialVibrateOnDetect = untrack(() => vibrateOnDetect);
	const initialBeepOnDetect = untrack(() => beepOnDetect);

	function setScanResultState(state: 'success' | 'error') {
		scanResultState = state;

		if (scanResultTimeout) {
			clearTimeout(scanResultTimeout);
		}

		scanResultTimeout = setTimeout(() => {
			scanResultState = 'idle';
		}, scanResultDurationMs);
	}

	const scanner = createQrScanner({
		cooldownMs: initialCooldownMs,
		formats: initialFormats,
		baseUrl: initialUrl,
		checkInPath: initialCheckInPath,
		vibrateOnDetect: initialVibrateOnDetect,
		beepOnDetect: initialBeepOnDetect,
		onDetect: (payload) => {
			if (showScanResult) {
				setScanResultState(isSuccessfulScan(payload) ? 'success' : 'error');
			}

			ondetect?.(payload);
			onDetect?.(payload);
		},
		onError: (error) => {
			onerror?.(error);
			onError?.(error);
		}
	});

	const { error } = scanner;

	onMount(async () => {
		scanner.attachVideo(videoEl);
		if (autoStart) {
			await scanner.start();
		}
	});

	onDestroy(() => {
		if (scanResultTimeout) {
			clearTimeout(scanResultTimeout);
		}

		scanner.stop();
	});

	export async function start() {
		await scanner.start();
	}

	export async function stop() {
		await scanner.stop();
	}

	export function pause() {
		scanner.pause();
	}

	export function resume() {
		scanner.resume();
	}
</script>

<div class={['qr-scanner', className]}>
	<video bind:this={videoEl} class="qr-scanner__video" playsinline muted></video>
	{#if highlightFrame}
		<div
			class={[
				'qr-scanner__frame',
				scanResultState === 'success' && 'qr-scanner__frame--success',
				scanResultState === 'error' && 'qr-scanner__frame--error'
			]}
		></div>
	{/if}

	{#if showScanResult && scanResultState !== 'idle'}
		<div
			class={[
				'qr-scanner__status',
				scanResultState === 'success' ? 'qr-scanner__status--success' : 'qr-scanner__status--error'
			]}
		>
			{#if scanResultState === 'success'}
				<svg class="qr-scanner__status-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"></path>
				</svg>
			{:else}
				<svg class="qr-scanner__status-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="m18.3 5.7-1-1L12 10l-5.3-5.3-1 1L11 11l-5.3 5.3 1 1L12 12l5.3 5.3 1-1L13 11z"
					></path>
				</svg>
			{/if}
		</div>
	{/if}
</div>

{#if $error}
	<p class="qr-scanner__error">{$error.message}</p>
{/if}

<style>
	.qr-scanner {
		position: relative;
		overflow: hidden;
		border-radius: 12px;
		background: #101010;
		aspect-ratio: 1 / 1;
	}

	.qr-scanner__video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.qr-scanner__frame {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 70%;
		height: 70%;
		transform: translate(-50%, -50%);
		border: 2px solid #22c55e;
		border-radius: 12px;
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}

	.qr-scanner__frame--success {
		border-color: #22c55e;
	}

	.qr-scanner__frame--error {
		border-color: #ef4444;
	}

	.qr-scanner__status {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.qr-scanner__status--success {
		background: rgba(34, 197, 94, 0.95);
		box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.25);
	}

	.qr-scanner__status--error {
		background: rgba(239, 68, 68, 0.95);
		box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.2);
	}

	.qr-scanner__status-icon {
		width: 32px;
		height: 32px;
		fill: #fff;
	}

	.qr-scanner__error {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: #ef4444;
	}
</style>
