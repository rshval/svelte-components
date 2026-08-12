<script lang="ts">
	import type { Map } from 'mapbox-gl';

	import { distance } from '@turf/turf';
	import { cableToMeters, kilometerToMeters, mileToMeters } from '$lib/constants.js';
	import { isMilesUnit, mapIsLoaded } from '../map-values.store.js';

	let { map }: { map: Map | undefined } = $props();

	$effect(() => {
		if (map && $mapIsLoaded) {
			getDistance();
			map.on('zoom', () => {
				getDistance();
			});
		}
	});

	let metersPerPixel: number | undefined = $state();
	const scaleDistance = $derived.by(() => {
		if (!metersPerPixel) return undefined;

		const mToP100 = metersPerPixel * 100;
		let unit = '';
		let value = 0;

		if ($isMilesUnit) {
			unit = mToP100 >= mileToMeters ? 'mi' : 'cbl';
			value = mToP100 >= mileToMeters ? mToP100 / mileToMeters : mToP100 / cableToMeters;
		} else {
			unit = mToP100 >= kilometerToMeters ? 'km' : 'm';
			value = mToP100 >= kilometerToMeters ? mToP100 / kilometerToMeters : mToP100;
		}

		return {
			value: Number(Math.round(value)) || 1,
			unit
		};
	});

	function getDistance() {
		const leftTop = map?.unproject([0, 0]);
		const rightTop = map?.unproject([100, 0]);
		if (leftTop !== undefined && rightTop !== undefined) {
			const turfDistance = distance(Object.values(leftTop), Object.values(rightTop), {
				units: 'meters'
			});
			metersPerPixel = turfDistance / 100;
		}
	}

	function toggleUnit() {
		$isMilesUnit = !$isMilesUnit;
	}
</script>

{#if scaleDistance}
	<div class="scale">
		<div class="scale__text" onclick={toggleUnit} role="none" tabindex="-1" onkeypress={() => {}}>
			{scaleDistance.value}
			{scaleDistance.unit}
		</div>
	</div>
{/if}

<style>
	.scale {
		position: absolute;
		top: calc(50% - 50px);
		height: 100px;
		left: 0.5em;
		border-left: 2px solid var(--color-text);
		display: flex;
		justify-content: center;
		vertical-align: baseline;
		flex-direction: column;
		opacity: 0.5;
	}
	.scale__text {
		cursor: pointer;
		position: absolute;
		top: calc(50% - 14px);
		left: 0.5em;
		color: var(--color-text);
		font-size: 0.775em;
		font-weight: bold;
		padding: 5px;
		width: max-content;
	}
</style>
