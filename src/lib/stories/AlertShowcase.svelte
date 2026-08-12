<script lang="ts">
	import Alert from '../components/Alert.svelte';
</script>

<div class="flex max-w-3xl flex-col gap-3">
	<Alert class="alert-info">
		<span>Info: profile sync will finish in the background.</span>
	</Alert>
	<Alert class="alert-success" y={0}>
		<span>Success: changes were saved.</span>
	</Alert>
	<Alert class="alert-warning" y={0}>
		<span>Warning: this action affects published content.</span>
	</Alert>
	<Alert class="alert-error" y={0}>
		<span>Error: upload failed. Check the file and try again.</span>
	</Alert>
</div>
