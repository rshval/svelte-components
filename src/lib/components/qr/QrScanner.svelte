<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { createQrScanner } from './create-qr-scanner.js';
	import type { ParsedQrPayload, QrScannerError, QrScannerFormat } from './types.js';

	type Props = {
		autoStart?: boolean;
		cooldownMs?: number;
		formats?: QrScannerFormat[];
		highlightFrame?: boolean;
		vibrateOnDetect?: boolean;
		beepOnDetect?: boolean;
		onDetect?: (payload: ParsedQrPayload) => void;
		onError?: (error: QrScannerError) => void;
		class?: string;
	};

	const props: Props = $props();

	let videoEl: HTMLVideoElement | null = null;

	const dispatch = createEventDispatcher<{ detect: ParsedQrPayload; error: QrScannerError }>();
	const scanner = createQrScanner({
		cooldownMs: props.cooldownMs ?? 2000,
		formats: props.formats ?? ['qr_code'],
		vibrateOnDetect: props.vibrateOnDetect ?? true,
		beepOnDetect: props.beepOnDetect ?? false,
		onDetect: (payload) => {
			props.onDetect?.(payload);
			dispatch('detect', payload);
		},
		onError: (error) => {
			props.onError?.(error);
			dispatch('error', error);
		}
	});

	const { error } = scanner;

	onMount(async () => {
		scanner.attachVideo(videoEl);
		if (props.autoStart ?? true) {
			await scanner.start();
		}
	});

	onDestroy(() => {
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

<div class={['qr-scanner', props.class]}>
	<video bind:this={videoEl} class="qr-scanner__video" playsinline muted></video>
	{#if props.highlightFrame ?? true}
		<div class="qr-scanner__frame"></div>
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

	.qr-scanner__error {
		margin-top: 0.75rem;
		font-size: 0.875rem;
		color: #ef4444;
	}
</style>
