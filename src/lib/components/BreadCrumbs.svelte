<script lang="ts">
	let {
		list,
		seo = false,
		class: className
	}: {
		list: { title: string | undefined; href?: string }[];
		seo?: boolean;
		class?: any;
	} = $props();
</script>

<div class={['breadcrumbs text-sm', className]}>
	{#if seo}
		<ol itemscope itemtype="http://schema.org/BreadcrumbList">
			{#each list as item, index}
				<li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
					<svelte:element
						this={list.length !== index + 1 ? 'a' : 'span'}
						itemscope
						itemtype="http://schema.org/Thing"
						itemprop="item"
						href={list.length !== index + 1 ? item.href : undefined}
						itemid={item.href}
					>
						<span itemprop="name">{item.title}</span>
					</svelte:element>
					<meta itemprop="position" content={String(index + 1)} />
				</li>
			{/each}
		</ol>
	{:else}
		<ul>
			{#each list as item, index}
				<li>
					{#if list.length !== index + 1}
						<a href={item.href}>{item.title}</a>
					{:else}
						<span class="opacity-70">{item.title}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.breadcrumbs ol:last-of-type li > span,
	.breadcrumbs ul:last-of-type li {
		cursor: unset;
	}
	.breadcrumbs ol:last-of-type li:hover > span,
	.breadcrumbs ul:last-of-type li:hover {
		text-decoration: none;
	}
</style>
