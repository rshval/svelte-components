import type { Icon as TypeIcon } from '@tabler/icons-svelte-runes';
import type { SvelteComponent, ComponentType, SvelteComponentTyped } from 'svelte';

declare global {
	namespace App {}
	namespace Models {
		interface User {
			_id?: string;
			name?: string;
			email?: string;
			phone?: string | E164Number;
			password?: string;
			_userRole?: string;
			createdAt?: string;
		}
	}
	namespace Stores {
		interface Session {
			['dc1_auth_key']?: string;
			['uid']?: string;
			['aid']?: string;
		}
	}
	namespace Plugins {
		interface DeviceInfo {
			type?: string;
			identifier?: string;
			langCode?: string;
			langTag?: string;
			name?: string;
			model: string;
			platform: 'ios' | 'android' | 'web';
			operatingSystem: 'ios' | 'android' | 'windows' | 'mac' | 'unknown';
			osVersion?: string;
			iOSVersion?: number;
			androidSDKVersion?: number;
			manufacturer: string;
			isVirtual?: boolean;
			webViewVersion: string;
		}
	}
	namespace Api {
		interface Opts {
			headers: { [key: string]: string };
			body?: string;
			data?: object;
			method: string;
			signal?: AbortSignal;
		}
	}
	namespace Components {
		namespace Select {
			interface Option {
				value: string;
				label: string;
			}
		}
		namespace Table {
			type Row = Record<string, unknown> & { id?: string; _id?: string };
			interface Column {
				component?: ComponentType<SvelteComponentTyped>;
				id?: string;
				flex?: boolean;
				className?: string;
				idType?: string;
				nowrap?: boolean;
				propsFn?: (row: Row) => Record<string, unknown>;
				props?: Record<string, unknown>;
				style?: string;
				title?: string;
				titleTpl?: () => string;
				tpl?: (row: Row, column: Column) => string;
			}
		}
	}
	namespace MapComponent {
		interface BoundsNesw {
			n: number;
			e: number;
			s: number;
			w: number;
			_ne: LngLat;
			_sw: LngLat;
		}
		interface Style {
			text?: string;
			id: string;
			value: string;
		}
		interface AddItem {
			id: string;
			title: string;
			icon?: TypeIcon;
			component?: SvelteComponent;
		}
		interface Coordinates {
			lng: number;
			lat: number;
		}
		interface Geolocation {
			latitude: number;
			longitude: number;
		}
		interface TransportType {
			id: string;
			icon: TypeIcon;
			active: boolean;
			disabled: boolean;
		}
		interface Location {
			coordinates: Coordinates;
			detailIsVisible?: boolean | undefined;
		}
		interface PixelCoordinates {
			x?: number;
			y?: number;
		}
		interface ClickPoint {
			lngLat: Coordinates;
		}
		interface NavigatePoint {
			id: string | number;
			type?: string;
			text?: string;
			coordinates: Coordinates;
			detailIsVisible?: boolean | undefined;
		}
		interface MapSearchResult {
			id: string;
			type: string;
			coordinates: string;
			text: string;
		}
		interface RoutePoint {
			point?: Position;
			text?: string;
			actived?: boolean;
		}
		interface MouseOverElement {
			id?: string;
			x?: number;
			y?: number;
			w?: number;
			h?: number;
			coordinates?: MapComponent.Coordinates;
			detailIsVisible?: boolean | undefined;
		}
		interface Pitch {
			'2d': number;
			'3d': number;
			[key: string]: number;
		}
	}
}

export {};
