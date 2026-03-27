import type { EnvLike, EventMap, SocketEnvelope } from './types.js';

export interface SocketClientOptions<
	TIncoming extends EventMap,
	TOutgoing extends EventMap,
	TEnv extends EnvLike = EnvLike
> {
	url?: string;
	urlEnvKey?: keyof TEnv & string;
	env?: TEnv;
	protocols?: string | string[];
	webSocketFactory?: (url: string, protocols?: string | string[]) => WebSocket;
	serialize?: <K extends keyof TOutgoing & string>(
		event: SocketEnvelope<K, TOutgoing[K]>
	) => string;
	deserialize?: (
		raw: string
	) => SocketEnvelope<keyof TIncoming & string, TIncoming[keyof TIncoming]>;
	onOpen?: (event: Event) => void;
	onClose?: (event: CloseEvent) => void;
	onError?: (event: Event) => void;
}

type Listener<TPayload> = (payload: TPayload) => void;
const WS_OPEN = 1;
const WS_CLOSED = 3;

export interface SocketClient<TIncoming extends EventMap, TOutgoing extends EventMap> {
	connect(): WebSocket;
	disconnect(code?: number, reason?: string): void;
	emit<K extends keyof TOutgoing & string>(type: K, payload: TOutgoing[K]): void;
	on<K extends keyof TIncoming & string>(type: K, listener: Listener<TIncoming[K]>): () => void;
	off<K extends keyof TIncoming & string>(type: K, listener: Listener<TIncoming[K]>): void;
	isConnected(): boolean;
	socket(): WebSocket | null;
}

const hasImportMetaEnv = () => {
	return typeof import.meta !== 'undefined' && typeof import.meta.env === 'object';
};

const getEnvValue = <TEnv extends EnvLike>(
	env: TEnv | undefined,
	key: keyof TEnv & string
): string | undefined => {
	if (env?.[key]) {
		return env[key];
	}

	if (hasImportMetaEnv()) {
		const importMetaEnv = import.meta.env as Record<string, string | undefined>;
		if (importMetaEnv[key]) {
			return importMetaEnv[key];
		}
	}

	if (typeof process !== 'undefined' && process.env?.[key]) {
		return process.env[key];
	}

	return undefined;
};

const resolveSocketUrl = <TEnv extends EnvLike>(
	url: string | undefined,
	urlEnvKey: (keyof TEnv & string) | undefined,
	env: TEnv | undefined
): string => {
	const resolved = url ?? (urlEnvKey ? getEnvValue(env, urlEnvKey) : undefined);
	if (!resolved) {
		throw new Error('createSocketClient: url (or urlEnvKey) is required');
	}
	return resolved;
};

const defaultSerialize = <K extends string, TPayload>(event: SocketEnvelope<K, TPayload>) =>
	JSON.stringify(event);

const defaultDeserialize = <TIncoming extends EventMap>(
	raw: string
): SocketEnvelope<keyof TIncoming & string, TIncoming[keyof TIncoming]> => JSON.parse(raw);

export const createSocketClient = <
	TIncoming extends EventMap,
	TOutgoing extends EventMap,
	TEnv extends EnvLike = EnvLike
>(
	options: SocketClientOptions<TIncoming, TOutgoing, TEnv>
): SocketClient<TIncoming, TOutgoing> => {
	const url = resolveSocketUrl(options.url, options.urlEnvKey, options.env);
	const wsFactory =
		options.webSocketFactory ??
		((connectionUrl: string, protocols?: string | string[]) =>
			new WebSocket(connectionUrl, protocols));
	const serialize = options.serialize ?? defaultSerialize;
	const deserialize = options.deserialize ?? defaultDeserialize<TIncoming>;
	let ws: WebSocket | null = null;

	const listeners = new Map<keyof TIncoming & string, Set<Listener<TIncoming[keyof TIncoming]>>>();

	const connect = (): WebSocket => {
		if (ws && ws.readyState !== WS_CLOSED) {
			return ws;
		}

		ws = wsFactory(url, options.protocols);
		ws.onopen = (event) => options.onOpen?.(event);
		ws.onclose = (event) => options.onClose?.(event);
		ws.onerror = (event) => options.onError?.(event);
		ws.onmessage = (event) => {
			if (typeof event.data !== 'string') {
				return;
			}

			const parsedEvent = deserialize(event.data);
			const eventListeners = listeners.get(parsedEvent.type);
			if (!eventListeners?.size) {
				return;
			}

			eventListeners.forEach((listener) => {
				listener(parsedEvent.payload as TIncoming[keyof TIncoming]);
			});
		};

		return ws;
	};

	const disconnect = (code?: number, reason?: string) => {
		if (!ws || ws.readyState === WS_CLOSED) {
			return;
		}

		ws.close(code, reason);
	};

	const emit = <K extends keyof TOutgoing & string>(type: K, payload: TOutgoing[K]) => {
		if (!ws || ws.readyState !== WS_OPEN) {
			throw new Error('createSocketClient: socket is not connected');
		}

		ws.send(serialize({ type, payload }));
	};

	const on = <K extends keyof TIncoming & string>(type: K, listener: Listener<TIncoming[K]>) => {
		const existing = listeners.get(type) ?? new Set<Listener<TIncoming[keyof TIncoming]>>();
		existing.add(listener as Listener<TIncoming[keyof TIncoming]>);
		listeners.set(type, existing);

		return () => off(type, listener);
	};

	const off = <K extends keyof TIncoming & string>(type: K, listener: Listener<TIncoming[K]>) => {
		const existing = listeners.get(type);
		if (!existing) {
			return;
		}

		existing.delete(listener as Listener<TIncoming[keyof TIncoming]>);
		if (!existing.size) {
			listeners.delete(type);
		}
	};

	const isConnected = () => {
		return ws?.readyState === WS_OPEN;
	};

	return {
		connect,
		disconnect,
		emit,
		on,
		off,
		isConnected,
		socket: () => ws
	};
};
