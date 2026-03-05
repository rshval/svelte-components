<script lang="ts">
	import type { Snippet } from 'svelte';
	import api from '$lib/plugins/api.js';
	import FileExportIcon from '@tabler/icons-svelte-runes/icons/file-export';
	import type { Component } from 'svelte';
	import Loader from '$lib/components/Loader.svelte';
	import Button from '$lib/components/Button.svelte';

	let {
		children,
		icon,
		class: className,
		multiple = false,
		fileId,
		accept = '.pdf,.xls,.xlsx',
		assetsPost,
		filterKey,
		onloading,
		onload,
		...props
	}: {
		children?: Snippet;
		icon?: Snippet;
		class?: any;
		fileId?: string;
		multiple?: boolean;
		filterKey?: string;
		accept?: string;
		assetsPost?: string;
		onloading?: any;
		onload?: any;
	} = $props();

	let elemFileInput: HTMLElement;

	let isLoading = $state(false);
	let filteredFiles: { [key: string]: any }[] = $state([]);
	let files: FileList | undefined = $state(undefined);

	$effect(() => {
		if (elemFileInput && files && files?.length >= 0) onReadFiles();
	});

	function onReadFiles() {
		let filesReadArr: object[] = [];
		if (files?.length) {
			for (const file of files) {
				filesReadArr = [{ file: file }, ...filesReadArr];
			}
			filteredFiles = [...filesReadArr];
		}
	}

	let filteredList: { [key: string]: any }[] = $state([]);

	$effect(() => {
		filteredList = filterKey ? [...filteredFiles].sort((a, b) => a[filterKey]) : filteredFiles;
	});

	$effect(() => {
		if (assetsPost && filteredList?.length) {
			filteredList.forEach((item) => {
				let reader = new FileReader();
				onloading?.(true);
				isLoading = true;
				reader.onload = async (e: ProgressEvent) => {
					const formData = new FormData();
					formData.set('file', item.file);
					if (fileId) {
						formData.set('fileId', fileId);
					}
					const response = await api.post(assetsPost, formData);
					if (response?.success) {
						onload?.(response);
					}
					onloading?.(false);
					isLoading = false;
				};
				reader.readAsDataURL(item.file);
			});
		}
	});
</script>

<Button onclick={() => elemFileInput.click()} disabled={isLoading} class={[className]}>
	{#if !isLoading}
		{#if icon}
			{@render icon?.()}
		{:else}
			<FileExportIcon />
		{/if}
		{@render children?.()}
	{:else}
		<Loader class="loading-sm" /> Загрузка...
	{/if}
</Button>

<input style="display:none" type="file" {multiple} {accept} bind:files bind:this={elemFileInput} />
