<script lang="ts">
	import Badge from '../components/Badge.svelte';
</script>

<div class="flex flex-col gap-5">
	<section class="flex flex-wrap items-center gap-2">
		<Badge>Default</Badge>
		<Badge class="badge-neutral">Neutral</Badge>
		<Badge class="badge-primary">Primary</Badge>
		<Badge class="badge-secondary">Secondary</Badge>
		<Badge class="badge-accent">Accent</Badge>
	</section>

	<section class="flex flex-wrap items-center gap-2">
		<Badge class="badge-info">Info</Badge>
		<Badge class="badge-success">Success</Badge>
		<Badge class="badge-warning">Warning</Badge>
		<Badge class="badge-error">Error</Badge>
	</section>

	<section class="flex flex-wrap items-center gap-2">
		<Badge class="badge-xs">XS</Badge>
		<Badge class="badge-sm">SM</Badge>
		<Badge>MD</Badge>
		<Badge class="badge-lg">LG</Badge>
		<Badge class="badge-outline">Outline</Badge>
	</section>
</div>
