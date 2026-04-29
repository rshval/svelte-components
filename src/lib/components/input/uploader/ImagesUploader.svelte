<script lang="ts">
	import api from '$lib/plugins/api.js';
	import IconCamera from '@tabler/icons-svelte-runes/icons/camera';
	import ImagesUploaderItem from './ImagesUploaderItem.svelte';
	import { tick } from 'svelte';
	import delay from 'delay';
	import Loader from '$lib/components/Loader.svelte';
	import {
		DEFAULT_IMAGE_ACCEPT,
		FILE_VALIDATION_ERROR_MESSAGES,
		FILE_VALIDATION_ERROR_CODES,
		normalizeAccept,
		validateFileByRules
	} from '$lib/helpers/file-validation.js';
	import {
		createUploadFormData,
		extractUploadedImages,
		type UploadedImagePayload
	} from './upload-form-data.js';

	interface UploadErrorContext {
		fileName?: string;
		code?: string;
	}

	let {
		multiple = false,
		disabled = false,
		assetsGet,
		assetsPost,
		pathPrefix,
		paths = $bindable([]),
		ids = $bindable([]),
		class: className,
		limit = 10,
		accept = [...DEFAULT_IMAGE_ACCEPT],
		maxFileSizeMb,
		validateFile,
		onerror
	}: {
		multiple?: boolean;
		disabled?: boolean;
		assetsGet: string;
		assetsPost: string;
		pathPrefix: string;
		paths?: string[];
		ids?: string[];
		class?: any;
		limit?: number;
		accept?: string | string[];
		maxFileSizeMb?: number;
		validateFile?: (file: File) => string | null;
		onerror?: (message: string, context?: UploadErrorContext) => void;
	} = $props();

	let fileinputElem: HTMLInputElement;
	let files: FileList | undefined = $state();
	const resolvedAccept = $derived(normalizeAccept(accept));
	const acceptAttribute = $derived(resolvedAccept.join(', '));

	interface FList {
		id: string;
		path?: string;
		file?: File;
		new?: boolean;
	}

	function createQueueItem(file: File): FList {
		return {
			id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
			file,
			new: true
		};
	}

	function emitError(message: string, context?: UploadErrorContext) {
		onerror?.(message, context);
	}

	$effect(() => {
		if (files && files.length > 0) onReadFiles();
	});

	let filteredFiles: FList[] = $state([]);
	function onReadFiles() {
		selectedIndex = null;
		const filesReadArr: FList[] = [];
		if (files?.length) {
			for (const file of files) {
				const validationError = validateFileByRules(file, { accept, maxFileSizeMb, validateFile });
				if (validationError) {
					const message =
						validationError.code === FILE_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT
							? `${FILE_VALIDATION_ERROR_MESSAGES.UNSUPPORTED_FORMAT} Allowed: ${resolvedAccept.join(', ')}.`
							: validationError.message;
					emitError(message, { fileName: file.name, code: validationError.code });
					continue;
				}
				filesReadArr.unshift(createQueueItem(file));
			}
			filteredFiles = filesReadArr;
			if (multiple && assetsPost && filesReadArr.length) {
				void uploadMultipleFiles(filesReadArr);
			}
		}
		if (fileinputElem?.value) fileinputElem.value = '';
	}

	let filteredList: FList[] | undefined = $state([]);
	$effect(() => {
		let list = [
			...(paths?.map((i: string, index: number) => {
				return { id: `uploaded-${i}-${index}`, path: i };
			}) || []),
			...filteredFiles
		];
		filteredList = list.length ? list : [];
	});

	let selectedItem: FList | null;
	let selectedIndex: number | null = $state(null);

	async function onClickFile(item: FList, index: number) {
		if (selectedItem !== item && selectedIndex !== index) {
			await delay(50);
			selectedItem = item;
			selectedIndex = index;
		}
	}

	let listElem = null;
	let isVisible = $state(true);

	async function onMain(item: FList, index: number) {
		isVisible = false;
		[paths[index], paths[0]] = [paths[0], paths[index]];
		[ids[index], ids[0]] = [ids[0], ids[index]];
		await tick();
		onCancel(item, index);
		isVisible = true;
	}

	let isLoading = $state(false);
	let isDisabled = $state(false);
	async function onRemove(item: FList, index: number) {
		if (item.path) {
			isDisabled = true;
			const result = await api.del(assetsPost + '/' + item.path);
			if (result.success) {
				isVisible = false;
				paths = paths?.filter((i: string) => i !== item.path);
				ids = ids?.filter((i: string | object) => i !== result.image._id);
				await tick();
				isVisible = true;
				onCancel(item, index);
			}
			isDisabled = false;
		}
	}

	async function onLoad(
		item: FList,
		response: { image: { path: string; destination: string; _id: string } }
	) {
		const [uploadedImage] = extractUploadedImages(response);
		if (!uploadedImage?.path) {
			return;
		}

		item.new = false;
		isVisible = false;
		paths = [...paths, ...[normalizeImagePath(uploadedImage)]];
		if (uploadedImage._id) {
			ids = [...ids, ...[uploadedImage._id]];
		}
		await tick();
		isVisible = true;
	}

	function normalizeImagePath(image: UploadedImagePayload) {
		if (!image.path) {
			return '';
		}

		return image.destination ? image.path.replace(image.destination, '') : image.path;
	}

	async function uploadMultipleFiles(items: FList[]) {
		const uploadableFiles = items
			.map((item) => item.file)
			.filter((file): file is File => file instanceof File);
		if (!uploadableFiles.length) {
			return;
		}

		isLoading = true;
		try {
			const response = await api.post(
				assetsPost,
				createUploadFormData({
					fieldName: 'image',
					files: uploadableFiles
				})
			);
			const uploadedImages = extractUploadedImages(response).filter((image) => image.path);
			if (!uploadedImages.length || uploadedImages.length !== uploadableFiles.length) {
				throw new Error('EMPTY_UPLOAD_RESPONSE');
			}

			isVisible = false;
			filteredFiles = filteredFiles.filter(
				(currentItem) => !items.some((item) => item.id === currentItem.id)
			);
			paths = [
				...paths,
				...uploadedImages.map((image) => normalizeImagePath(image)).filter(Boolean)
			];
			ids = [
				...ids,
				...uploadedImages.map((image) => image._id).filter((id): id is string => Boolean(id))
			];
			await tick();
			isVisible = true;
		} catch {
			filteredFiles = filteredFiles.filter(
				(currentItem) => !items.some((item) => item.id === currentItem.id)
			);
			emitError('Failed to upload images. Please try again.', { code: 'UPLOAD_FAILED' });
		} finally {
			isLoading = false;
		}
	}

	async function onUploadError(item: FList, message: string, context?: UploadErrorContext) {
		filteredFiles = filteredFiles.filter((currentItem) => currentItem.id !== item.id);
		if (selectedItem?.id === item.id) {
			selectedItem = null;
			selectedIndex = null;
		}
		emitError(message, context);
	}

	function onCancel(item: FList, index: number) {
		if (selectedItem?.path === item.path) {
			selectedItem = null;
			selectedIndex = null;
		}
	}
	function onClickUpload() {
		if (!isLoading || isLimited || disabled || isDisabled) {
			fileinputElem?.click();
		}
	}
	let isLimited = $state(false);
	$effect(() => {
		if (filteredList?.length) {
			isLimited = filteredList.filter((file) => !file.new).length >= limit;
		}
	});
</script>

<div class="file-upload">
	<div
		class={['upload bordered rounded-xl border-gray-400/20 bg-base-100', className]}
		class:upload_disabled={disabled || isLimited || isDisabled}
		class:upload_loading={isLoading}
		role="none"
		onclick={onClickUpload}
	>
		<div class="icon">
			{#if isLoading}
				<Loader />
			{:else}
				<IconCamera />
			{/if}
		</div>
	</div>
	<div class="list" bind:this={listElem} role="none">
		{#if isVisible && filteredList}
			{#each filteredList as item, i (item.id)}
				{#if item.new !== false}
					<div
						class="file rounded-xl"
						role="none"
						class:selected={selectedIndex === i}
						onclick={() => onClickFile(item, i)}
					>
						<ImagesUploaderItem
							onmain={() => onMain(item, i)}
							onremove={() => onRemove(item, i)}
							onload={(response: any) => onLoad(item, response)}
							onerror={(message: string, context?: UploadErrorContext) =>
								onUploadError(item, message, {
									...context,
									fileName: context?.fileName || item.file?.name
								})}
							oncancel={() => onCancel(item, i)}
							{assetsPost}
							path={item.path
								? (assetsGet ? assetsGet + '/' + item.path : item.path) +
									(pathPrefix ? pathPrefix : '')
								: undefined}
							file={item.file}
							isNew={item.new}
							uploadOnMount={!multiple}
							disabled={disabled || isLoading || isDisabled}
							selected={selectedIndex === i}
						/>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<input
	style="display:none"
	type="file"
	{multiple}
	accept={acceptAttribute}
	bind:files
	disabled={disabled || isLimited || isDisabled}
	name="photo"
	bind:this={fileinputElem}
/>

<style>
	.file-upload {
		display: flex;
		gap: 0.5em;
		overflow: hidden;
	}
	.upload {
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
		min-width: 100px;
		transition: background-color var(--transition-time) ease-out;
		border-width: 1px;
	}
	.upload:hover {
		opacity: 0.7;
	}
	.upload_disabled {
		opacity: 0.5;
		cursor: unset;
	}
	.upload_disabled:hover {
		opacity: 0.5;
	}
	.upload_loading {
		opacity: 0.5;
	}
	.upload_loading:hover {
		opacity: 0.5;
	}
	.icon {
		margin: 0.5em;
	}
	.list {
		position: relative;
		overflow-x: auto;
		flex: 1;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 0.5em;
	}
	.file {
		overflow: hidden;
		background-color: var(--color-theme-5);
		width: 100px;
		height: 100px;
		min-width: 100px;
		cursor: pointer;
	}
	.selected {
		background-color: var(--color-theme-4);
	}
</style>
