<script lang="ts">
	import Button from '../components/Button.svelte';
</script>

<div class="flex flex-col gap-6">
	<section class="flex flex-wrap items-center gap-3">
		<Button class="btn-primary">Primary action</Button>
		<Button class="btn-secondary">Secondary</Button>
		<Button class="btn-accent">Accent</Button>
		<Button class="btn-ghost">Ghost</Button>
		<Button class="btn-outline">Outline</Button>
	</section>

	<section class="flex flex-wrap items-center gap-3">
		<Button class="btn-xs">Extra small</Button>
		<Button class="btn-sm">Small</Button>
		<Button>Default</Button>
		<Button class="btn-lg">Large</Button>
	</section>

	<section class="flex flex-wrap items-center gap-3">
		<Button class="btn-success">Saved</Button>
		<Button class="btn-warning">Needs review</Button>
		<Button class="btn-error">Delete</Button>
		<Button disabled class="btn-primary">Disabled</Button>
		<Button class="btn-square" aria-label="Icon button">+</Button>
	</section>
</div>
