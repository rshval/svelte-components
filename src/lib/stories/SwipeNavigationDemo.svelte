<script lang="ts">
	import { onMount } from 'svelte';
	import { appGoto, BackButton, SwipeNavigation } from '../index.js';

	type DemoRoute = {
		id: string;
		title: string;
		description: string;
		items: string[];
	};

	const routes: DemoRoute[] = [
		{
			id: 'catalog',
			title: 'Catalog',
			description: 'A list screen that can open product and checkout routes.',
			items: ['New arrivals', 'Saved filters', 'Recommended collections']
		},
		{
			id: 'product',
			title: 'Product',
			description: 'A detail route pushed through the same navigation helper.',
			items: ['Size: M', 'Color: graphite', 'Delivery: tomorrow']
		},
		{
			id: 'checkout',
			title: 'Checkout',
			description: 'A deeper route so the back stack has several entries.',
			items: ['Address confirmed', 'Payment ready', 'Summary checked']
		}
	];

	let activeRoute = $state<DemoRoute>(routes[0]);

	function findRoute(url: string) {
		const pathname = new URL(url, window.location.origin).pathname;
		const id = pathname.split('/').filter(Boolean).at(-1) ?? 'catalog';

		return routes.find((route) => route.id === id) ?? routes[0];
	}

	function isRouteEnabled(pathname: string) {
		return routes.some((route) => pathname === `/${route.id}`);
	}

	async function navigateTo(route: DemoRoute) {
		await appGoto(`/${route.id}`);
	}

	function navigate(url: string) {
		activeRoute = findRoute(url);
	}

	onMount(() => navigate('/catalog'));
</script>

<SwipeNavigation {isRouteEnabled} {navigate}>
	<main class="min-h-dvh bg-base-200 text-base-content">
		<div class="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-base-100">
			<header class="border-b border-base-300 px-4 py-3">
				<div class="flex items-center justify-between gap-3">
					<BackButton text="Back" class="btn btn-ghost btn-sm" />

					<p class="text-sm font-medium">Router route: /{activeRoute.id}</p>
				</div>
			</header>

			<section class="flex flex-1 flex-col gap-5 px-4 py-5">
				<div class="space-y-2">
					<h1 class="text-2xl font-semibold">{activeRoute.title}</h1>
					<p class="text-sm opacity-75">{activeRoute.description}</p>
				</div>

				<nav class="tabs tabs-box w-full" aria-label="Demo routes">
					{#each routes as route (route.id)}
						<button
							type="button"
							class="tab flex-1"
							class:tab-active={route.id === activeRoute.id}
							aria-current={route.id === activeRoute.id ? 'page' : undefined}
							onclick={() => navigateTo(route)}
						>
							{route.title}
						</button>
					{/each}
				</nav>

				<div class="space-y-3">
					{#each activeRoute.items as item (item)}
						<div class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
							<p class="text-sm font-medium">{item}</p>
						</div>
					{/each}
				</div>

				<div class="mt-auto rounded-box bg-base-200 p-4 text-sm">
					<p class="font-medium">Router integration</p>
					<p class="mt-1 opacity-75">
						Route buttons call appGoto(). SwipeNavigation registers a navigator and BackButton uses
						its context back stack.
					</p>
				</div>
			</section>
		</div>
	</main>
</SwipeNavigation>
