export type EnvLike = Record<string, string | undefined>;

export type MaybePromise<T> = T | Promise<T>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type EventMap = Record<string, unknown>;

export interface SocketEnvelope<TType extends string = string, TPayload = unknown> {
	type: TType;
	payload: TPayload;
}
