<script lang="ts">
	import FileExportIcon from '@tabler/icons-svelte-runes/icons/file-export';
	import FileUploader from '../components/input/uploader/FileUploader.svelte';

	let loading = $state(false);
	let error = $state('');
	let uploadState = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap gap-3">
		<FileUploader
			accept=".pdf,.xls,.xlsx"
			maxFileSizeMb={5}
			onloading={(value: boolean) => (loading = value)}
			onerror={(message: string) => (error = message)}
		>
			Upload document
		</FileUploader>

		<FileUploader
			multiple
			accept="image/png,image/jpeg"
			maxFileSizeMb={2}
			onerror={(message: string) => (error = message)}
		>
			{#snippet icon()}
				<FileExportIcon size={20} />
			{/snippet}
			Upload images
		</FileUploader>
	</div>

	<div class="rounded-box border border-base-300 bg-base-100 p-4 text-sm">
		<p>Loading: {loading ? 'yes' : 'no'}</p>
		<p>Last validation error: {error || 'none'}</p>
	</div>

	<div class="rounded-box border border-base-300 bg-base-100 p-4 text-sm">
		<div class="mb-3 flex flex-wrap gap-2">
			<button type="button" class="btn btn-sm" onclick={() => (uploadState = 'loading')}>
				Show loading
			</button>
			<button
				type="button"
				class="btn btn-sm btn-success"
				onclick={() => (uploadState = 'success')}
			>
				Show success
			</button>
			<button type="button" class="btn btn-error btn-sm" onclick={() => (uploadState = 'error')}>
				Show error
			</button>
			<button type="button" class="btn btn-ghost btn-sm" onclick={() => (uploadState = 'idle')}>
				Reset
			</button>
		</div>

		{#if uploadState === 'loading'}
			<p class="text-info">Uploading selected files...</p>
		{:else if uploadState === 'success'}
			<p class="text-success">Upload finished successfully.</p>
		{:else if uploadState === 'error'}
			<p class="text-error">Upload failed. Try again or choose another file.</p>
		{:else}
			<p class="opacity-70">Use the buttons to preview upload feedback states.</p>
		{/if}
	</div>
</div>
