<script lang="ts">
	import Theme from '../components/theme/Theme.svelte';
	import ThemeButton from '../components/theme/ThemeButton.svelte';
</script>

<Theme>
	<div class="rounded-box border border-base-300 bg-base-100 p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 class="text-lg font-semibold">Theme container</h2>
				<p class="text-sm opacity-70">Base colors and theme button rendered inside Theme.</p>
			</div>
			<ThemeButton />
		</div>

		<div class="mt-5 grid gap-3 md:grid-cols-3">
			<div class="rounded-box bg-primary p-4 text-primary-content">Primary surface</div>
			<div class="rounded-box bg-secondary p-4 text-secondary-content">Secondary surface</div>
			<div class="rounded-box bg-accent p-4 text-accent-content">Accent surface</div>
		</div>
	</div>
</Theme>
