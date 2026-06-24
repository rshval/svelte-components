<script lang="ts">
	import type { Snippet } from 'svelte';
	import api from '$lib/plugins/api.js';
	import FileExportIcon from '@tabler/icons-svelte-runes/icons/file-export';
	import type { Component } from 'svelte';
	import Loader from '$lib/components/Loader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { validateFileByRules } from '$lib/helpers/file-validation.js';
	import { createUploadFormData } from './upload-form-data.js';

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
		maxFileSizeMb,
		validateFile,
		onerror,
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
		maxFileSizeMb?: number;
		validateFile?: (file: File) => string | null;
		onerror?: (message: string, context?: { fileName?: string; code?: string }) => void;
	} = $props();

	let elemFileInput: HTMLElement;

	type UploadQueueItem = Record<string, unknown> & { file: File };

	let isLoading = $state(false);
	let filteredFiles: UploadQueueItem[] = $state([]);
	let files: FileList | undefined = $state(undefined);

	$effect(() => {
		if (elemFileInput && files && files?.length >= 0) onReadFiles();
	});

	function onReadFiles() {
		let filesReadArr: UploadQueueItem[] = [];
		if (files?.length) {
			for (const file of files) {
				const validationError = validateFileByRules(file, { accept, maxFileSizeMb, validateFile });
				if (validationError) {
					onerror?.(validationError.message, { fileName: file.name, code: validationError.code });
					continue;
				}
				filesReadArr = [{ file: file }, ...filesReadArr];
			}
			filteredFiles = [...filesReadArr];
			if (assetsPost && filesReadArr.length) {
				void uploadFiles(sortFiles(filesReadArr));
			}
		}
		if (elemFileInput instanceof HTMLInputElement && elemFileInput.value) elemFileInput.value = '';
	}

	function sortFiles(items: UploadQueueItem[]) {
		if (!filterKey) {
			return items;
		}

		return [...items].sort((a, b) => {
			const aValue = normalizeSortableValue(a[filterKey]);
			const bValue = normalizeSortableValue(b[filterKey]);
			if (aValue === bValue) {
				return 0;
			}

			return aValue > bValue ? 1 : -1;
		});
	}

	function normalizeSortableValue(value: unknown): number | string | bigint {
		if (typeof value === 'number' || typeof value === 'string' || typeof value === 'bigint') {
			return value;
		}

		if (value instanceof Date) {
			return value.valueOf();
		}

		if (value && typeof value === 'object') {
			const primitive = value.valueOf();
			if (
				typeof primitive === 'number' ||
				typeof primitive === 'string' ||
				typeof primitive === 'bigint'
			) {
				return primitive;
			}
		}

		return '';
	}

	async function uploadFiles(items: UploadQueueItem[]) {
		if (!assetsPost) {
			return;
		}

		onloading?.(true);
		isLoading = true;

		try {
			if (multiple) {
				const response = await api.post(
					assetsPost,
					createUploadFormData({
						fieldName: 'file',
						files: items.map((item) => item.file),
						extraFields: fileId ? { fileId } : undefined
					})
				);
				if (response?.success) {
					onload?.(response);
				}
				return;
			}

			for (const item of items) {
				const response = await api.post(
					assetsPost,
					createUploadFormData({
						fieldName: 'file',
						files: [item.file],
						extraFields: fileId ? { fileId } : undefined
					})
				);
				if (response?.success) {
					onload?.(response);
				}
			}
		} finally {
			onloading?.(false);
			isLoading = false;
		}
	}
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
