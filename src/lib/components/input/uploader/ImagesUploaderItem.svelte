<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { clickOutside } from '$lib/helpers/events.js';
	import Loader from '$lib/components/Loader.svelte';
	import api from '$lib/plugins/api.js';
	import { animationDuration } from '$lib/constants.js';

	import IconPhoto from '@tabler/icons-svelte-runes/icons/photo';
	import IconPhotoX from '@tabler/icons-svelte-runes/icons/photo-x';
	import IconPhotoStar from '@tabler/icons-svelte-runes/icons/photo-star';
	import IconCircleX from '@tabler/icons-svelte-runes/icons/circle-x';

	let {
		src,
		assetsPost,
		path,
		file,
		selected = false,
		disabled = false,
		isNew = false,
		onmain,
		oncancel,
		onremove,
		onload
	}: {
		src?: string;
		path?: string;
		assetsPost: string;
		file?: Blob | File;
		selected: boolean;
		disabled: boolean;
		isNew?: boolean;
		title?: string;
		onmain: any;
		oncancel: any;
		onremove: any;
		onload: any;
	} = $props();

	let imgPath: string | null = $state(null);

	let fileSrc: string | null = $state(null);
	let isLoading = $state(false);

	$effect(() => {
		if (file) {
			let reader = new FileReader();
			if (isNew) {
				isLoading = true;
				reader.onload = async (e: ProgressEvent<FileReader>) => {
					if (typeof e.target?.result === 'string') {
						fileSrc = e.target?.result;
						const formData = new FormData();
						formData.set('image', file);
						const response = await api.post(assetsPost, formData);
						if (response?.image) {
							onload?.(response);
						}
					}
					isLoading = false;
				};
				reader.readAsDataURL(file);
			} else {
				reader.onload = (e: ProgressEvent<FileReader>) => {
					if (typeof e.target?.result === 'string') {
						fileSrc = e.target?.result;
					}
				};
				reader.readAsDataURL(file);
			}
		}
	});

	onMount(() => {
		const img = new Image();
		img.onload = () => {
			imgPath = img.src;
		};
		img.onerror = () => {
			imgPath = null;
		};
		img.crossOrigin = 'anonymous';
		if (src) img.src = src;
		else if (path) img.src = path;
	});
	function handleRemove() {
		if (!disabled) onremove(true);
	}
	function handleCancel() {
		if (!disabled) oncancel(true);
	}
	function handleMain() {
		if (!disabled) onmain?.(true);
	}
</script>

<div class="item" use:clickOutside={() => handleCancel()} class:item_disabled={disabled}>
	<div class="item__wrap" class:selected class:loaded={!selected && isLoading}>
		{#if imgPath || fileSrc}
			<img loading="lazy" crossorigin="anonymous" src={imgPath ? imgPath : fileSrc} alt="file" />
		{:else if !selected}
			<IconPhoto />
		{/if}
	</div>
	{#if isLoading && !selected}
		<div class="item__loader" in:fade={{ duration: animationDuration }}>
			<Loader />
		</div>
	{/if}
	{#if selected && !isLoading}
		<div
			class="item__menu"
			in:fly|local={{ y: 50, duration: animationDuration }}
			out:fly|local={{ y: 50, duration: animationDuration }}
		>
			<div role="none" onclick={() => handleMain()}>
				<IconPhotoStar />
			</div>
			<div role="none" onclick={() => handleRemove()}>
				<IconPhotoX />
			</div>
		</div>
	{:else if selected && isLoading}
		<div
			class="item__menu"
			in:fly|local={{ y: 50, duration: animationDuration }}
			out:fly|local={{ y: 50, duration: animationDuration }}
		>
			<div role="none" onclick={() => handleCancel()}>
				<IconCircleX />
			</div>
		</div>
	{/if}
</div>

<style>
	.item {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}
	.item__menu,
	.item__loader {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		z-index: 1;
	}
	.item__menu > div {
		display: flex;
		padding: 0.5em;
	}
	.item__wrap {
		display: flex;
	}
	.item__wrap.selected {
		opacity: 0.2;
	}
	.item__wrap.loaded {
		opacity: 0.4;
	}
	img {
		width: 100px;
		height: 100px;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		max-width: 100%;
		max-height: 100%;
		overflow: hidden;
		vertical-align: bottom;
		transition:
			max-width var(--transition-time) ease-out,
			max-height var(--transition-time) ease-out,
			width var(--transition-time) ease-out,
			height var(--transition-time) ease-out,
			margin var(--transition-time) ease-out;
	}
	.item__wrap.selected img {
		width: 110%;
		height: 110%;
		max-width: 110%;
		max-height: 110%;
		margin-left: -5%;
		margin-top: -5%;
		margin-right: -5%;
		margin-bottom: -5%;
	}
	.item_disabled {
		opacity: 0.5;
	}
</style>
