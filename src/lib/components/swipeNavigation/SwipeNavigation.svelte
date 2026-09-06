<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount, setContext, tick, type Snippet } from 'svelte';
	import { usePan, type GestureCustomEvent } from 'svelte-gestures';
	import { toBlob } from 'html-to-image';

	import { registerAppNavigator } from './navigation.js';

	import { SWIPE_NAVIGATION_CONTEXT, type SwipeNavigationApi } from './context.js';

	function defaultNavigate(url: string) {
		return goto(url, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	let {
		children,
		enabled = true,
		isRouteEnabled = () => true,
		navigate = defaultNavigate
	} = $props<{
		children: Snippet;
		enabled?: boolean;
		isRouteEnabled?: (pathname: string) => boolean;
		navigate?: (url: string) => Promise<void> | void;
	}>();

	let livePage: HTMLDivElement;
	let previousLayer: HTMLDivElement;

	type Entry = {
		id: number;
		url: string;
		imageUrl: string | null;
		fallbackNode: HTMLElement | null;
		scrollY: number;
	};

	const MAX_ENTRIES = 5;

	const FORWARD_DURATION = 460;
	const BACK_DURATION = 320;

	const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

	const PARALLAX = 8;
	const DIM = 0.06;

	const COMMIT_RATIO = 0.27;
	const MIN_VELOCITY = 0.5;

	/*
	 * Пока палец не прошёл это расстояние,
	 * считаем действие обычным tap.
	 */
	const PAN_START_THRESHOLD = 18;

	/*
	 * Жест back не должен конкурировать с UI.
	 * Если касание началось на button/link/input и т.п.,
	 * pan вообще не участвует в этом pointer sequence.
	 *
	 * Для своих интерактивных областей (карусель, карта,
	 * drag-компонент и т.д.) добавляй атрибут data-no-swipe:
	 *
	 *   <div data-no-swipe>...</div>
	 *
	 * Тогда свайп назад, начатый внутри этого блока,
	 * будет полностью отключён, а собственные жесты блока
	 * останутся приоритетными.
	 */

	const backStack: Entry[] = [];

	let nextId = 1;

	let currentEntry: Entry | null = null;

	let mounted = false;
	let lastEnabled = false;

	let animating = false;
	let captureGeneration = 0;
	let captureTimer: number | null = null;

	/*
	 * gestureCandidate:
	 * пользователь только коснулся экрана.
	 *
	 * gestureActive:
	 * горизонтальный swipe уже реально начался.
	 */
	let gestureCandidate = false;
	let gestureActive = false;

	let gestureTarget: Entry | null = null;

	let startX = 0;
	let currentX = 0;
	let startedAt = 0;

	/*
	 * Forward transition можно перехватить пальцем
	 * до того, как он закончился.
	 */
	let forwardAnimating = false;
	let forwardToken = 0;
	let gestureInterruptedForward = false;
	let gestureBaseX = 0;

	/* =========================================================
	 * Helpers
	 * ======================================================= */

	function sleep(ms: number) {
		return new Promise<void>((resolve) => {
			window.setTimeout(resolve, ms);
		});
	}

	function frame() {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
	}

	function twoFrames() {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => resolve());
			});
		});
	}

	function urlKey(url: URL | string) {
		const parsed = typeof url === 'string' ? new URL(url, window.location.origin) : url;

		return parsed.pathname + parsed.search + parsed.hash;
	}

	function routeIsEnabled(url: URL | string) {
		const parsed = typeof url === 'string' ? new URL(url, window.location.origin) : url;

		return isRouteEnabled(parsed.pathname);
	}

	function getTranslateX(element: HTMLElement) {
		const transform = window.getComputedStyle(element).transform;

		if (!transform || transform === 'none') {
			return 0;
		}

		try {
			return new DOMMatrixReadOnly(transform).m41;
		} catch {
			return 0;
		}
	}

	function isInteractiveTarget(target: EventTarget | null) {
		if (!(target instanceof Element)) {
			return false;
		}

		return Boolean(
			target.closest(
				//'a, button, input, textarea, select, option, label, summary, [role="button"], [role="link"],[contenteditable="true"],',
				'[data-no-swipe]'
			)
		);
	}

	/* =========================================================
	 * Memory
	 * ======================================================= */

	function dispose(entry: Entry | null) {
		if (!entry) return;

		if (entry.imageUrl) {
			URL.revokeObjectURL(entry.imageUrl);

			entry.imageUrl = null;
		}

		entry.fallbackNode = null;
	}

	function trimStack() {
		while (backStack.length > MAX_ENTRIES) {
			const removed = backStack.shift();

			if (removed) {
				dispose(removed);
			}
		}
	}

	/* =========================================================
	 * Screenshot
	 * ======================================================= */

	function cancelScheduledCapture() {
		if (captureTimer === null) {
			return;
		}

		window.clearTimeout(captureTimer);

		captureTimer = null;
	}

	function scheduleCapture(delay = 300) {
		if (!browser || !enabled) return;

		cancelScheduledCapture();

		captureTimer = window.setTimeout(() => {
			captureTimer = null;

			if (!animating && !gestureActive) {
				void captureCurrentPage();
			}
		}, delay);
	}

	async function captureCurrentPage() {
		if (!enabled || !browser || !livePage || !currentEntry || animating || gestureActive) {
			return;
		}

		const generation = ++captureGeneration;

		const expectedId = currentEntry.id;

		const expectedUrl = currentEntry.url;

		await twoFrames();

		if (
			generation !== captureGeneration ||
			currentEntry?.id !== expectedId ||
			urlKey(location.href) !== expectedUrl ||
			animating ||
			gestureActive
		) {
			return;
		}

		try {
			const pageHeight = livePage.scrollHeight;

			let ratio = Math.min(window.devicePixelRatio || 1, 2);

			if (pageHeight > 5000) {
				ratio = 1;
			} else if (pageHeight > 3000) {
				ratio = Math.min(ratio, 1.5);
			}

			const blob = await toBlob(livePage, {
				backgroundColor: '#ffffff',

				pixelRatio: ratio,

				cacheBust: false,

				width: livePage.clientWidth,

				height: pageHeight
			});

			if (
				!blob ||
				generation !== captureGeneration ||
				currentEntry?.id !== expectedId ||
				urlKey(location.href) !== expectedUrl ||
				animating ||
				gestureActive
			) {
				return;
			}

			const imageUrl = URL.createObjectURL(blob);

			const preload = new Image();

			preload.src = imageUrl;

			try {
				await preload.decode();
			} catch {
				// ignore
			}

			if (
				generation !== captureGeneration ||
				currentEntry?.id !== expectedId ||
				animating ||
				gestureActive
			) {
				URL.revokeObjectURL(imageUrl);

				return;
			}

			if (currentEntry.imageUrl) {
				URL.revokeObjectURL(currentEntry.imageUrl);
			}

			currentEntry.imageUrl = imageUrl;

			/*
			 * Настоящий PNG готов —
			 * DOM fallback больше не нужен.
			 */
			currentEntry.fallbackNode = null;

			currentEntry.scrollY = window.scrollY;
		} catch (error) {
			console.warn('Snapshot failed:', error);
		}
	}

	/* =========================================================
	 * Synchronous DOM fallback
	 * ======================================================= */

	function ensureFallback(entry: Entry) {
		if (entry.imageUrl || entry.fallbackNode) {
			return;
		}

		const clone = livePage.cloneNode(true) as HTMLElement;

		clone.style.transition = 'none';

		clone.style.transform = 'none';

		clone.style.visibility = 'visible';

		clone.style.opacity = '1';

		clone.style.width = '100%';

		clone.style.pointerEvents = 'none';

		entry.fallbackNode = clone;
	}

	/* =========================================================
	 * Previous layer
	 * ======================================================= */

	function showPrevious(entry: Entry, offset = -PARALLAX) {
		previousLayer.style.display = 'none';

		previousLayer.replaceChildren();

		previousLayer.style.transition = 'none';

		previousLayer.style.transform = `translate3d(${offset}%,0,0)`;

		previousLayer.style.zIndex = '1';

		/*
		 * Приоритет — PNG.
		 */
		if (entry.imageUrl) {
			const image = new Image();

			image.src = entry.imageUrl;

			image.alt = '';

			image.style.position = 'absolute';

			image.style.left = '0';

			image.style.top = '0';

			image.style.width = '100%';

			image.style.height = 'auto';

			image.style.maxWidth = 'none';

			image.style.transform = `translate3d(0,-${entry.scrollY}px,0)`;

			image.style.pointerEvents = 'none';

			image.style.userSelect = 'none';

			previousLayer.appendChild(image);
		} else if (entry.fallbackNode) {
			const clone = entry.fallbackNode.cloneNode(true) as HTMLElement;

			clone.style.position = 'absolute';

			clone.style.left = '0';

			clone.style.top = `-${entry.scrollY}px`;

			clone.style.width = '100%';

			clone.style.pointerEvents = 'none';

			previousLayer.appendChild(clone);
		} else {
			return false;
		}

		const dim = document.createElement('div');

		dim.className = 'previous-dim';

		dim.style.opacity = String(DIM);

		previousLayer.appendChild(dim);

		void previousLayer.offsetWidth;

		previousLayer.style.display = 'block';

		return true;
	}

	function hidePrevious() {
		previousLayer.style.display = 'none';

		previousLayer.style.transition = '';

		previousLayer.style.transform = '';

		previousLayer.style.zIndex = '1';

		previousLayer.replaceChildren();
	}

	function freezePrevious() {
		previousLayer.style.transition = 'none';

		previousLayer.style.transform = 'translate3d(0,0,0)';

		previousLayer.style.zIndex = '50';
	}

	function setDim(value: number) {
		const dim = previousLayer.querySelector<HTMLElement>('.previous-dim');

		if (dim) {
			dim.style.opacity = String(value);
		}
	}

	function setDimTransition(duration: number) {
		const dim = previousLayer.querySelector<HTMLElement>('.previous-dim');

		if (dim) {
			dim.style.transition = `opacity ${duration}ms linear`;
		}
	}

	function resetLive() {
		livePage.style.transition = '';
		livePage.style.transform = '';
		livePage.style.visibility = '';
		livePage.style.opacity = '';
		livePage.style.pointerEvents = '';
	}

	/* =========================================================
	 * Forward
	 * ======================================================= */

	async function navigateForward(url: string) {
		/*
		 * Если текущая или целевая страница не участвует
		 * в SwipeNavigation, выполняем обычный переход
		 * без snapshot/stack/gesture-логики.
		 */
		if (!enabled || !routeIsEnabled(url)) {
			await navigate(url);

			return;
		}

		if (animating || !currentEntry) {
			return;
		}

		const targetUrl = urlKey(url);

		if (targetUrl === currentEntry.url) {
			return;
		}

		cancelScheduledCapture();
		captureGeneration++;

		animating = true;
		forwardAnimating = true;
		gestureInterruptedForward = false;

		const token = ++forwardToken;

		const previous = currentEntry;

		previous.scrollY = window.scrollY;

		/*
		 * Если PNG ещё не готов, синхронный
		 * DOM fallback гарантирует forward/back.
		 */
		ensureFallback(previous);

		backStack.push(previous);
		trimStack();

		showPrevious(previous, 0);

		livePage.style.transition = 'none';
		livePage.style.transform = 'translate3d(100%,0,0)';
		livePage.style.visibility = 'hidden';

		await navigate(url);

		currentEntry = {
			id: nextId++,
			url: targetUrl,
			imageUrl: null,
			fallbackNode: null,
			scrollY: 0
		};

		window.scrollTo(0, 0);

		await tick();
		await frame();

		/*
		 * Пока DOM скрыт, жест перехватить нельзя.
		 * С этого момента страница уже видима и её
		 * можно «поймать» пальцем во время заезда.
		 */
		livePage.style.visibility = 'visible';
		livePage.style.transition = 'none';
		livePage.style.transform = 'translate3d(100%,0,0)';

		void livePage.offsetWidth;
		await frame();

		previousLayer.style.transition = `transform ${FORWARD_DURATION}ms ${EASE}`;
		previousLayer.style.transform = `translate3d(-${PARALLAX}%,0,0)`;

		livePage.style.transition = `transform ${FORWARD_DURATION}ms ${EASE}`;
		livePage.style.transform = 'translate3d(0,0,0)';

		await sleep(FORWARD_DURATION);

		/*
		 * Если пользователь перехватил transition,
		 * его gesture теперь полностью управляет слоями.
		 */
		if (token !== forwardToken) {
			return;
		}

		hidePrevious();
		resetLive();

		forwardAnimating = false;
		animating = false;

		scheduleCapture();
	}

	/* =========================================================
	 * Actual Back navigation
	 * ======================================================= */

	async function performBack(target: Entry) {
		freezePrevious();

		/*
		 * Старый route скрываем, пока SvelteKit
		 * подменяет children под snapshot.
		 */
		livePage.style.transition = 'none';
		livePage.style.visibility = 'hidden';
		livePage.style.transform = 'translate3d(0,0,0)';

		cancelScheduledCapture();
		captureGeneration++;

		await navigate(target.url);

		await tick();

		window.scrollTo(0, target.scrollY);

		/*
		 * Ключевой момент:
		 * после tick настоящий target DOM уже есть.
		 * Делаем handoff в ОДНОЙ JS-задаче, без await frame().
		 * Браузер увидит уже конечное состояние одним paint.
		 *
		 * Поэтому нет окна, где страница визуально готова,
		 * но navigateForward ещё заблокирован animating=true.
		 */
		livePage.style.transition = 'none';
		livePage.style.transform = 'translate3d(0,0,0)';
		livePage.style.visibility = 'visible';
		livePage.style.pointerEvents = 'auto';

		previousLayer.style.display = 'none';

		hidePrevious();
		resetLive();

		const popped = backStack.pop();

		if (popped) {
			dispose(popped);
		}

		currentEntry = {
			id: target.id,
			url: target.url,
			imageUrl: null,
			fallbackNode: null,
			scrollY: target.scrollY
		};

		gestureInterruptedForward = false;
		forwardAnimating = false;
		animating = false;

		/*
		 * После этой строки первый tap уже обычный tap:
		 * никакой очереди и второго нажатия не нужно.
		 */
		scheduleCapture();
	}

	/* =========================================================
	 * Pan gesture
	 * ======================================================= */

	function panDown(event: GestureCustomEvent) {
		if (!enabled) {
			gestureCandidate = false;
			gestureActive = false;
			gestureTarget = null;
			return;
		}

		/*
		 * Обычные анимации блокируют gesture,
		 * но forward-анимацию разрешено перехватить.
		 */
		if (animating && !forwardAnimating) {
			gestureCandidate = false;
			gestureActive = false;
			gestureTarget = null;
			return;
		}

		const target = backStack.at(-1);

		if (!target || (!target.imageUrl && !target.fallbackNode)) {
			gestureCandidate = false;
			gestureActive = false;
			gestureTarget = null;
			return;
		}

		const pointer = event.detail.event;

		if (
			pointer.pointerType !== 'touch' &&
			pointer.pointerType !== 'pen' &&
			pointer.pointerType !== 'mouse'
		) {
			return;
		}

		/*
		 * Если касание началось на интерактивном UI,
		 * полностью отдаём этот pointer sequence элементу.
		 * Это гарантирует обычный click с первого раза.
		 *
		 * data-no-swipe можно поставить на любой свой блок,
		 * которому нужны собственные touch/drag-жесты.
		 */
		if (isInteractiveTarget(pointer.target)) {
			gestureCandidate = false;
			gestureActive = false;
			gestureTarget = null;
			return;
		}

		/*
		 * Пока это только кандидат: tap не ломаем.
		 */
		gestureCandidate = true;
		gestureActive = false;
		gestureTarget = target;
		gestureInterruptedForward = false;

		startX = pointer.clientX;
		currentX = 0;
		gestureBaseX = 0;
		startedAt = performance.now();
	}

	function panMove(event: GestureCustomEvent) {
		if (!gestureCandidate && !gestureActive) {
			return;
		}

		const pointer = event.detail.event;

		const dx = pointer.clientX - startX;

		/* Влево наша навигация никогда не стартует. */
		if (!gestureActive && dx <= 0) {
			return;
		}

		/* До 18px это всё ещё обычный tap/микросмещение пальца. */
		if (!gestureActive && dx < PAN_START_THRESHOLD) {
			return;
		}

		if (!gestureActive) {
			const target = gestureTarget;

			if (!target) {
				gestureCandidate = false;
				return;
			}

			/*
			 * Если новый экран ещё заезжает справа,
			 * замораживаем его ровно в текущей позиции.
			 */
			if (forwardAnimating) {
				gestureBaseX = Math.max(0, getTranslateX(livePage));

				forwardToken++;
				forwardAnimating = false;
				animating = false;
				gestureInterruptedForward = true;

				livePage.style.transition = 'none';
				livePage.style.transform = `translate3d(${gestureBaseX}px,0,0)`;

				const progress = Math.min(1, gestureBaseX / window.innerWidth);

				previousLayer.style.transition = 'none';
				previousLayer.style.transform = `translate3d(${-PARALLAX + progress * PARALLAX}%,0,0)`;
				setDim(DIM * (1 - progress));
			} else {
				gestureBaseX = 0;
				showPrevious(target, -PARALLAX);
				livePage.style.transition = 'none';
			}

			gestureActive = true;
			gestureCandidate = false;

			cancelScheduledCapture();
			captureGeneration++;
		}

		currentX = Math.min(Math.max(gestureBaseX + dx, 0), window.innerWidth);

		const progress = currentX / window.innerWidth;

		livePage.style.transform = `translate3d(${currentX}px,0,0)`;

		const previousX = -PARALLAX + progress * PARALLAX;

		previousLayer.style.transform = `translate3d(${previousX}%,0,0)`;

		setDim(DIM * (1 - progress));
	}

	function panUp(event: GestureCustomEvent) {
		if (!gestureActive) {
			gestureCandidate = false;
			gestureTarget = null;
			currentX = 0;
			return;
		}

		const pointer = event.detail.event;

		const dx = pointer.clientX - startX;

		currentX = Math.min(Math.max(gestureBaseX + dx, currentX, 0), window.innerWidth);

		gestureCandidate = false;
		gestureActive = false;
		gestureTarget = null;

		if (currentX <= 0) {
			hidePrevious();
			resetLive();
			gestureInterruptedForward = false;
			return;
		}

		const progress = currentX / window.innerWidth;

		const elapsed = Math.max(performance.now() - startedAt, 1);

		/*
		 * Скорость считаем только по движению пальца,
		 * а не по стартовой позиции прерванного forward.
		 */
		const velocity = Math.max(dx, 0) / elapsed;

		if (progress >= COMMIT_RATIO || velocity >= MIN_VELOCITY) {
			void commitBack();
		} else {
			void cancelBack();
		}
	}

	function panHandler() {}

	const panGesture = usePan(
		panHandler,
		() => ({
			delay: 0,
			touchAction: 'pan-y'
		}),
		{
			onpandown: panDown,

			onpanmove: panMove,

			onpanup: panUp
		}
	);

	/* =========================================================
	 * Back API for UI components
	 * ======================================================= */

	async function backFromUi() {
		const target = backStack.at(-1);

		if (!enabled || !target || gestureActive) {
			return;
		}

		/*
		 * Если кнопка «Назад» нажата, пока текущая страница
		 * ещё заезжает справа, прерываем forward так же,
		 * как это делает интерактивный swipe-back.
		 */
		if (forwardAnimating) {
			forwardToken++;
			forwardAnimating = false;
			animating = false;
			gestureInterruptedForward = true;

			livePage.style.transition = 'none';
			livePage.style.transform = `translate3d(${Math.max(0, getTranslateX(livePage))}px,0,0)`;

			previousLayer.style.transition = 'none';
		} else if (animating) {
			return;
		} else {
			/*
			 * При обычном клике у нас нет pointer-drag,
			 * поэтому сначала показываем предыдущий экран
			 * в той же стартовой позиции, что и у swipe.
			 */
			showPrevious(target, -PARALLAX);

			livePage.style.transition = 'none';
			livePage.style.transform = 'translate3d(0,0,0)';

			await frame();
		}

		await commitBack();
	}

	const navigationApi: SwipeNavigationApi = {
		back: backFromUi,

		canGoBack: () =>
			enabled && backStack.length > 0 && !gestureActive && (!animating || forwardAnimating)
	};

	setContext(SWIPE_NAVIGATION_CONTEXT, navigationApi);

	/* =========================================================
	 * Commit / Cancel
	 * ======================================================= */

	async function commitBack() {
		const target = backStack.at(-1);

		if (!target || (!target.imageUrl && !target.fallbackNode) || animating) {
			hidePrevious();
			resetLive();

			return;
		}

		animating = true;

		livePage.style.transition = `transform ${BACK_DURATION}ms ${EASE}`;

		previousLayer.style.transition = `transform ${BACK_DURATION}ms ${EASE}`;

		setDimTransition(BACK_DURATION);

		livePage.style.transform = 'translate3d(100vw,0,0)';

		previousLayer.style.transform = 'translate3d(0,0,0)';

		setDim(0);

		await sleep(BACK_DURATION);

		livePage.style.visibility = 'hidden';

		await performBack(target);
	}

	async function cancelBack() {
		if (animating) return;

		animating = true;

		livePage.style.transition = `transform ${BACK_DURATION}ms ${EASE}`;

		previousLayer.style.transition = `transform ${BACK_DURATION}ms ${EASE}`;

		setDimTransition(BACK_DURATION);

		livePage.style.transform = 'translate3d(0,0,0)';

		previousLayer.style.transform = `translate3d(-${PARALLAX}%,0,0)`;

		setDim(DIM);

		await sleep(BACK_DURATION);

		hidePrevious();
		resetLive();

		gestureInterruptedForward = false;
		forwardAnimating = false;
		animating = false;

		scheduleCapture();
	}

	/* =========================================================
	 * Scroll
	 * ======================================================= */

	function handleScroll() {
		if (!currentEntry || animating) {
			return;
		}

		currentEntry.scrollY = window.scrollY;
	}

	function resetNavigationState() {
		cancelScheduledCapture();
		captureGeneration++;
		forwardToken++;

		gestureCandidate = false;
		gestureActive = false;
		gestureTarget = null;
		gestureInterruptedForward = false;
		forwardAnimating = false;
		animating = false;

		if (previousLayer) {
			hidePrevious();
		}

		if (livePage) {
			resetLive();
		}

		for (const entry of backStack) {
			dispose(entry);
		}

		backStack.length = 0;
		dispose(currentEntry);
		currentEntry = null;
	}

	/*
	 * Компонент остаётся смонтированным между маршрутами.
	 * enabled включает/выключает механику только для выбранных
	 * страниц, не заставляя layout пересоздавать компонент.
	 */
	$effect(() => {
		const active = enabled;

		if (!browser || !mounted || active === lastEnabled) {
			return;
		}

		lastEnabled = active;

		if (!active) {
			resetNavigationState();
			return;
		}

		currentEntry = {
			id: nextId++,
			url: urlKey(location.href),
			imageUrl: null,
			fallbackNode: null,
			scrollY: window.scrollY
		};

		scheduleCapture(250);
	});

	/* =========================================================
	 * Init
	 * ======================================================= */

	onMount(() => {
		mounted = true;
		lastEnabled = enabled;

		if (enabled) {
			currentEntry = {
				id: nextId++,
				url: urlKey(location.href),
				imageUrl: null,
				fallbackNode: null,
				scrollY: window.scrollY
			};
		}

		const unregister = registerAppNavigator(navigateForward);

		window.addEventListener('scroll', handleScroll, {
			passive: true
		});

		if (enabled) {
			scheduleCapture(250);
		}

		return () => {
			unregister();

			window.removeEventListener('scroll', handleScroll);

			mounted = false;
			resetNavigationState();
		};
	});
</script>

<div class="navigation">
	<div bind:this={previousLayer} class="previous" aria-hidden="true"></div>

	<div bind:this={livePage} class="current" {...panGesture}>
		{@render children()}
	</div>
</div>

<style>
	:global(html),
	:global(body) {
		width: 100%;

		overflow-x: hidden;

		overscroll-behavior-x: none;
	}

	.navigation {
		position: relative;

		width: 100%;
		min-height: 100%;

		overflow-x: clip;

		isolation: isolate;
	}

	.previous {
		position: fixed;

		inset: 0;

		z-index: 1;

		display: none;

		width: 100%;
		height: 100dvh;

		overflow: hidden;

		background: #fff;

		opacity: 1;

		pointer-events: none;

		transform: translate3d(-9%, 0, 0);

		will-change: transform;

		contain: paint;

		isolation: isolate;

		backface-visibility: hidden;

		-webkit-backface-visibility: hidden;
	}

	.previous :global(.previous-dim) {
		position: absolute;

		inset: 0;

		z-index: 2;

		background: #000;

		opacity: 0.06;

		pointer-events: none;

		will-change: opacity;
	}

	.current {
		position: relative;

		z-index: 2;

		width: 100%;
		min-height: 100%;

		opacity: 1;

		transform: translate3d(0, 0, 0);

		will-change: transform;

		isolation: isolate;

		backface-visibility: hidden;

		-webkit-backface-visibility: hidden;
	}

	@media (prefers-reduced-motion: reduce) {
		.previous,
		.current {
			transition: none !important;
		}
	}
</style>
