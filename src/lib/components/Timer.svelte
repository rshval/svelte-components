<script lang="ts">
	import { onMount } from 'svelte';
	import { readable } from 'svelte/store';

	let {
		timer = 30,
		end = $bindable(false)
	}: {
		timer: number;
		end: boolean;
	} = $props();

	let start = $state(0);
	let time = $state(0);
	let toWait = $state(1);
	let minutes = $state(0);
	let seconds = $state(0);
	let isMounted = $state(false);

	onMount(() => {
		start = Date.now();
		isMounted = true;
	});

	const mstime = readable(Date.now(), (set) => {
		if (typeof window === 'undefined') return;

		let animationFrame = 0;
		const next = () => {
			set(Date.now());
			animationFrame = requestAnimationFrame(next);
		};

		next();
		return () => cancelAnimationFrame(animationFrame);
	});

	$effect(() => {
		if (!isMounted) return;
		time = Math.floor(($mstime - start) / 1000);
	});

	$effect(() => {
		toWait = Math.max(timer - time, 0);
	});

	$effect(() => {
		minutes = Math.floor(toWait / 60);
		seconds = toWait % 60;
		end = toWait === 0;
	});

	const paddedMinutes = $derived(String(minutes).padStart(2, '0'));
	const paddedSeconds = $derived(String(seconds).padStart(2, '0'));
</script>

<span class="timer">
	<span class="minutes">{paddedMinutes}</span>
	<span class="seconds">:{paddedSeconds}</span>
</span>
