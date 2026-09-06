export const SWIPE_NAVIGATION_CONTEXT = Symbol('swipe-navigation');

export type SwipeNavigationApi = {
	back: () => Promise<void>;
	canGoBack: () => boolean;
};
