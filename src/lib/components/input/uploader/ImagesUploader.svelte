<script lang="ts">
	import api from '$lib/plugins/api.js';
	import IconCamera from '@tabler/icons-svelte-runes/icons/camera';
	import ImagesUploaderItem from './ImagesUploaderItem.svelte';
	import { tick } from 'svelte';
	import delay from 'delay';
	import Loader from '$lib/components/Loader.svelte';

	let {
		multiple = false,
		disabled = false,
		assetsGet,
		assetsPost,
		pathPrefix,
		paths = $bindable([]),
		ids = $bindable([]),
		class: className,
		limit = 10
	}: {
		multiple?: boolean;
		disabled?: boolean;
		assetsGet: string;
		assetsPost: string;
		pathPrefix: string;
		paths?: string[]; // url файлов для отображения
		ids?: string[]; //id объектов для обновления
		class?: any;
		limit?: number;
	} = $props();

	let fileinputElem: HTMLInputElement;
	let files: FileList | undefined = $state();

	interface FList {
		path?: string;
		file?: File;
		new?: boolean;
	}

	$effect(() => {
		if (files && files.length > 0) onReadFiles();
	});

	let filteredFiles: FList[] = $state([]);
	function onReadFiles() {
		selectedIndex = null;
		let filesReadArr: FList[] = [];
		if (files?.length) {
			for (const file of files) {
				filesReadArr = [{ file: file, new: true }, ...filesReadArr];
			}
			filteredFiles = [...filesReadArr];
		}
		if (fileinputElem?.value) fileinputElem.value = '';
	}

	let filteredList: FList[] | undefined = $state([]);
	$effect(() => {
		if (updatedPaths || !updatedPaths) {
			let list = [
				...(paths?.map((i: string) => {
					return { path: i };
				}) || []),
				...filteredFiles
			];
			filteredList = list.length ? list : []; //list.sort((a, b) => a.main)
		}
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

	let updatedPaths = $state(false);
	async function onMain(item: FList, index: number) {
		updatedPaths = false;
		isVisible = false;
		[paths[index], paths[0]] = [paths[0], paths[index]];
		[ids[index], ids[0]] = [ids[0], ids[index]];
		updatedPaths = true;
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
		response: { image: { path: string; destination: string; _id: string } } // main: boolean
	) {
		if (response?.image) {
			item.new = false;
			isVisible = false;
			paths = [...paths, ...[response.image.path.replace(response.image.destination, '')]];
			ids = [...ids, ...[response.image._id]];
			await tick();
			isVisible = true;
		}
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
			{#each filteredList as item, i}
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
							oncancel={() => onCancel(item, i)}
							{assetsPost}
							path={item.path
								? (assetsGet ? assetsGet + '/' + item.path : item.path) +
									(pathPrefix ? pathPrefix : '')
								: undefined}
							file={item.file}
							isNew={item.new}
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
	accept="image/png, image/jpeg"
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
