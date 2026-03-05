<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, setContext, onDestroy, tick } from 'svelte';
	import { mapbox, key } from './mapbox.js';
	import {
		mapIsLoaded,
		mapMouseCoordinates,
		mapStyleIsLoaded,
		touchFingersCount
	} from './map-values.store.js';
	import type {
		MapOptions,
		ProjectionSpecification,
		Map,
		MapMouseEvent,
		MapTouchEvent
	} from 'mapbox-gl';
	import { getLayers } from './geojson-functions.js';

	let {
		children,
		map = $bindable(),
		mapStyle,
		accessToken = '',
		lat, //широта
		lng, //долгота
		zoom, //увеличение
		maxZoom = 20, // на сколько можно приблизить карту
		minZoom = 4, // на сколько можно отдалить карту
		dragPan = true,
		dragRotate = true,
		interactive = true,
		longpressDuration = 400, //время задержки долгого нажатия
		onlongpress,
		onclick,
		ondblclick,
		onresizestart,
		onresizeend,
		ontouchend,
		onstyleload,
		onload,
		onmouseup,
		onmoveend,
		onusermoveend,
		onflyend,
		ondenied
	}: {
		children?: Snippet;
		map: Map | undefined;
		accessToken: string;
		mapStyle: MapComponent.Style | undefined;
		lat: number; //широта
		lng: number; //долгота
		zoom: number; //увеличение
		maxZoom: number; // на сколько можно приблизить карту
		minZoom?: number; // на сколько можно отдалить карту
		dragPan?: boolean;
		dragRotate?: boolean;
		interactive?: boolean;
		longpressDuration?: number; //время задержки долгого нажатия
		onlongpress?: (e: MapMouseEvent | MapTouchEvent) => void;
		onclick?: (e: MapMouseEvent) => void;
		ondblclick?: (e: MapMouseEvent | CustomEvent) => void;
		ontouchend?: (e: MapTouchEvent) => void;
		onresizestart?: (e: MouseEvent) => void;
		onresizeend?: (e: MouseEvent) => void;
		onstyleload?: (loaded: boolean) => void;
		onload?: (loaded: boolean) => void;
		onmouseup?: (e: MapMouseEvent) => void;
		onmoveend?: (e: any) => void;
		onusermoveend?: (e: any) => void;
		onflyend?: (e: any) => void;
		ondenied?: (e: CustomEvent) => void; //custom user geolocation denied
	} = $props();

	let resizeStart = $state(false);
	let timeoutResizingId: ReturnType<typeof setTimeout>;

	let isMount = $state(false);
	onMount(() => {
		isMount = true;
	});
	onDestroy(() => {
		if (map) map.remove();
		$mapIsLoaded = false;
	});

	setContext(key, {
		getMap: () => map
	});

	$effect(() => {
		if (isMount && mapStyle) {
			mapSetStyle();
			addBaseEvents();
		}
	});
	function mapSetStyle() {
		if (map && mapStyle) map.setStyle('mapbox://styles/' + mapStyle.value);
	}

	function initMap(container: HTMLElement) {
		if (mapStyle) {
			map = new mapbox.Map({
				accessToken: accessToken,
				container,
				style: 'mapbox://styles/' + mapStyle.value,
				center: [Number(lng), Number(lat)],
				attributionControl: false,
				zoom,
				dragPan,
				dragRotate,
				interactive,
				projection: {
					name: 'mercator' //'mercator' as keyof Projection
				} as ProjectionSpecification,
				maxZoom,
				minZoom,
				...({ language: 'ru' } as Partial<MapOptions>)
			});
		}
	}

	function addBaseEvents() {
		if (map) {
			map.on('style.load', () => {
				onstyleload?.(true);
				$mapStyleIsLoaded = true;
				doMapStyleLoaded();
			});
			map.on('load', () => {
				onload?.(true);
				$mapIsLoaded = true;
				doMapStyleLoaded();
				addMapEvents();
			});
		}
	}

	let longpressTimerId: ReturnType<typeof setTimeout>;

	function resetLongpressTimer() {
		if (longpressTimerId) {
			clearTimeout(longpressTimerId); // сбрасываем долгое нажатие
		}
	}
	function onContextmenu(e: Event) {
		e.preventDefault();
		// e: MapMouseEvent
		// onlongpress(e);
	}
	function addMapEvents() {
		map?.on('click', (e: MapMouseEvent) => {
			onclick?.(e);
		});
		map?.on('dblclick', (e: MapMouseEvent) => {
			ondblclick?.(e);
		});
		//нажали клик
		map?.on('mousedown', (e: MapMouseEvent) => {
			if (e.originalEvent.button !== 2) {
				resetLongpressTimer();
				longpressTimerId = setTimeout(() => {
					// долгое нажатие
					onlongpress?.(e);
				}, longpressDuration);
			}
		});
		//отпустили клик
		map?.on('mouseup', (e: MapMouseEvent) => {
			onmouseup?.(e);
			if (e.originalEvent.button === 2) {
				onlongpress?.(e);
			}
			resetLongpressTimer();
		});
		//при перетаскивании
		map?.on('move', () => {
			// e: MapMouseEvent | MapTouchEvent
			resetLongpressTimer();
		});
		// DragEvent
		map?.on('moveend', (originalEvent) => {
			onmoveend?.(originalEvent);
			if (map && map.fire) {
				if (originalEvent) {
					map.fire('usermoveend');
				} else {
					map.fire('flyend');
				}
			}
		});
		map?.on('usermoveend', (originalEvent) => {
			onusermoveend?.(originalEvent);
		});
		map?.on('flyend', (originalEvent) => {
			onflyend?.(originalEvent);
		});
		//тач событие - палец на экране
		map?.on('touchstart', (e: MapTouchEvent) => {
			resetLongpressTimer();
			$touchFingersCount = ++$touchFingersCount;
			if ($touchFingersCount === 1) {
				longpressTimerId = setTimeout(() => {
					// долгое нажатие
					onlongpress?.(e);
				}, longpressDuration);
			}
		});
		map?.on('touchend', (e: MapTouchEvent) => {
			ontouchend?.(e);
			//тач событие - убрали палец
			$touchFingersCount = 0;
			// if(longpressTimerId) ontouch(e);
			resetLongpressTimer();
		});
		map?.on('touchcancel', () => {
			// e: MapTouchEvent
			//тач событие - отменилось
			$touchFingersCount = 0;
			// if(longpressTimerId) ontouch(e);
			resetLongpressTimer();
		});
		map?.on('resize', () => {
			resetLongpressTimer();
			if (!resizeStart) resizeStart = true;
			if (timeoutResizingId) clearTimeout(timeoutResizingId);
			tick();
			timeoutResizingId = setTimeout(() => {
				resizeStart = false;
			}, 300);
		});
		/**
		 * Custom events
		 */
		map?.on('resizestart', (e: MouseEvent) => {
			onresizestart?.(e);
		});
		map?.on('resizeend', (e: MouseEvent) => {
			onresizeend?.(e);
		});
		map?.on('denied', (e: CustomEvent) => {
			ondenied?.(e);
		});
	}

	/**
	 * Custom events
	 */
	$effect(() => {
		resizeStart === true ? map?.fire?.('resizestart') : map?.fire?.('resizeend');
	});

	$effect(() => {
		if ($mapIsLoaded && document) {
			removeMapControls();
			setTimeout(() => {
				removeMapControls();
			}, 100);
		}
	});
	function removeMapControls() {
		if (map) {
			//Убираем блок с контролами карты
			let selectors = [
				'div.mapboxgl-control-container',
				'div.mapboxgl-canary',
				'div.mapboxgl-ctrl-logo',
				'div.mapboxgl-ctrl'
			];
			selectors.map((s) => {
				document.querySelectorAll(s).forEach(function (a) {
					a.remove();
				});
			});
		}
	}
	$effect(() => {
		if ($mapIsLoaded && $mapStyleIsLoaded) {
			doMapRiversData();
		}
	});

	// $effect(() => {
	// });

	async function doMapRiversData() {
		// // //https://www.google.com/search?q=%D0%BA%D1%80%D1%83%D0%BF%D0%BD%D1%8B%D0%B5+%D1%80%D0%B5%D0%BA%D0%B8+%D1%80%D0%BE%D1%81%D1%81%D0%B8%D0%B8&oq=%D0%BA%D1%80%D1%83%D0%BF%D0%BD%D1%8B%D0%B5+%D1%80%D0%B5%D0%BA%D0%B8+%D1%80%D0%BE%D1%81%D1%81%D0%B8%D0%B8&aqs=chrome..69i57j46i512j0i512l2j46i512j0i512j46i512j0i512l2.3714j0j7&sourceid=chrome&ie=UTF-8
		// await addRiverToMap(map, '1730417'); //Река Волга
		// await addRiverToMap(map, '13177938'); //Река Казанка
		// await addRiverToMap(map, '221993'); //Река Кама
		// await addRiverToMap(map, '286091607', 'way'); //Река Большой Черемшан (Димитровград)
		// await addRiverToMap(map, '416351'); //Река Дон
		// await addRiverToMap(map, '165099'); //Река Белая, Приволжский федеральный округ, Россия
		// await addRiverToMap(map, '2094452');//Река Клязьма, Центральный федеральный округ, Россия
		// await addRiverToMap(map, '163223'); //Река Ока, Центральный федеральный округ, Россия
		// await addRiverToMap(map, '166171'); //Река Лена, Дальневосточный федеральный округ, Россия
		// await addRiverToMap(map, '2098340');//Река Иртыш, Сибирский федеральный округ, Россия
		// await addRiverToMap(map, '2469254');//Река Обь, Уральский федеральный округ, Россия
		// await addRiverToMap(map, '181988'); //Река Енисей, Сибирский федеральный округ, Россия
		// await addRiverToMap(map, '2172321');//Река Малый Енисей, Сибирский федеральный округ, Россия
		// await addRiverToMap(map, '172040'); //Река Ангара, Сибирский федеральный округ, Россия
		// await addRiverToMap(map, '173183'); //Река Нижняя Тунгуска, Сибирский федеральный округ, Россия
		// await addRiverToMap(map, '197653'); //Река Амур, Дальневосточный федеральный округ, Россия
		// await addRiverToMap(map, '166236'); //Река Вилюй, Дальневосточный федеральный округ, Россия
		// await addRiverToMap(map, '161305'); //Река Аргунь, Дальневосточный федеральный округ, Россия
		// await addRiverToMap(map, '389341'); //Река Москва, Россия
		// await addRiverToMap(map, '187560'); //Река Хантайка
		// await addRiverToMap(map, '185104'); //Река Пясина (Норильск)
		// await addRiverToMap(map, '14030782'); //Река норильская
		// Моря
		// await addRiverToMap(map, '3987743'); //Каспийское море
		// await addRiverToMap(map, '5486417'); //Азовское море
		// await addRiverToMap(map, '7160849'); //Черное море
		// await addRiverToMap(map, '9621450');  // Охотское море
		// await addRiverToMap(map, '12666169'); // Японское море
		// Водохранилища
		// await addRiverToMap(map, '166275'); //Вилюйское водохранилище
		// await addRiverToMap(map, '184889'); //Усть-Хантайское водохранилище
		// Озера
		// await addRiverToMap(map, '187461'); // Озеро Хантайское
		// await addRiverToMap(map, '185402'); // Озеро Пясино
		// await addRiverToMap(map, '555716'); //Озеро Байкал
		// Линии
		// await addRiverToMap(map, '1', 'lines'); //Линия Волго-Донского канала
		// await addRiverToMap(map, 'kazan', 'lines'); //Линия kazan
	}

	async function doMapStyleLoaded() {
		if (map) {
			const layers = getLayers(map);
			if (layers) {
				if (!map.getSource('waterway')) {
					map.addSource('waterway', {
						type: 'vector',
						url: 'mapbox://mapbox.mapbox-streets-v8'
					});
				}
			}
		}
	}

	function handleMousemove(e: MouseEvent) {
		$mapMouseCoordinates = { x: e.clientX, y: e.clientY };
	}
	// function rightClickContextMenu(e: Event) {
	// 	e.preventDefault();
	// }
</script>

<!--class:map_opacity={!$mapIsLoaded}-->
<div
	use:initMap
	class="map h-full min-h-full w-full max-w-full flex-1 grow-1 cursor-pointer overflow-hidden"
	oncontextmenu={onContextmenu}
	onmousemove={handleMousemove}
	role="none"
>
	{#if map}
		{@render children?.()}
	{/if}
</div>

<style>
	.map {
		flex-grow: 1;
		/**prevent-select*/
		-webkit-touch-callout: none;
		-webkit-tap-highlight-color: transparent;
		-moz-user-select: -moz-none;
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
		/* transition:
			opacity var(--transition-time) ease-out; */
	}
	/* .map_opacity {
		opacity: 0;
	} */
	:global(.mapboxgl-control-container) {
		display: none;
	}
</style>
