<script lang="ts">
	import { onMount } from 'svelte';

	let { file, isNew = false, path, onerror }: any = $props();

	onMount(() => {
		if (isNew && file) {
			onerror?.('Server rejected file', { fileName: file.name, code: 'SERVER_ERROR' });
		}
	});
</script>

<div data-testid={isNew ? 'new-item' : 'existing-item'}>{file?.name || path}</div>
