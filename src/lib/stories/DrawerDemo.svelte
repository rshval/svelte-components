<script lang="ts">
	import Drawer from '../components/drawer/Drawer.svelte';
	import { isOpenedDrawer } from '../components/drawer/drawer.store.js';
</script>

<Drawer>
	{#snippet button()}
		<button type="button" class="btn btn-primary" onclick={() => ($isOpenedDrawer = true)}>
			Open navigation drawer
		</button>
	{/snippet}

	<nav aria-label="Story navigation" class="flex flex-col gap-2">
		<a class="btn justify-start btn-ghost" href="#overview">Overview</a>
		<a class="btn justify-start btn-ghost" href="#orders">Orders</a>
		<a class="btn justify-start btn-ghost" href="#settings">Settings</a>
		<button type="button" class="btn mt-4 btn-outline" onclick={() => ($isOpenedDrawer = false)}>
			Close drawer
		</button>
	</nav>
</Drawer>
