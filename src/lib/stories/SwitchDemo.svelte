<script lang="ts">
	import Switch from '../components/Switch.svelte';

	let notifications = $state(true);
	let compact = $state(false);
</script>

<div class="flex flex-col gap-5">
	<label class="flex items-center gap-3">
		<Switch bind:checked={notifications} styleType="primary" aria-label="Email notifications" />
		<span>Email notifications: {notifications ? 'enabled' : 'disabled'}</span>
	</label>

	<label class="flex items-center gap-3">
		<Switch bind:checked={compact} styleType="success" aria-label="Compact mode" />
		<span>Compact mode: {compact ? 'on' : 'off'}</span>
	</label>

	<div class="flex flex-wrap items-center gap-4">
		<Switch checked styleType="info" aria-label="Info state" />
		<Switch checked styleType="warning" aria-label="Warning state" />
		<Switch checked styleType="error" aria-label="Error state" />
		<Switch checked disabled aria-label="Disabled enabled state" />
		<Switch disabled aria-label="Disabled off state" />
	</div>
</div>
