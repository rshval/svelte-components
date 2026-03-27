import type { EnvLike, HttpMethod, MaybePromise } from './types.js';

type ApiQueryValue = string | number | boolean | null | undefined;

type QueryParams = Record<string, ApiQueryValue | ApiQueryValue[]>;

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method' | 'headers'> {
	method?: HttpMethod;
	path: string;
	query?: QueryParams;
	body?: BodyInit | Record<string, unknown> | null;
	headers?: HeadersInit;
}

export interface ApiClientOptions<TEnv extends EnvLike = EnvLike> {
	baseUrl?: string;
	baseUrlEnvKey?: keyof TEnv & string;
	env?: TEnv;
	fetch?: typeof fetch;
	headers?: HeadersInit;
	getToken?: () => MaybePromise<string | null | undefined>;
	tokenHeaderName?: string;
	tokenPrefix?: string;
}

export interface ApiClient {
	request<TResponse = unknown>(options: ApiRequestOptions): Promise<TResponse>;
	get<TResponse = unknown>(
		path: string,
		options?: Omit<ApiRequestOptions, 'path' | 'method'>
	): Promise<TResponse>;
	post<TResponse = unknown>(
		path: string,
		options?: Omit<ApiRequestOptions, 'path' | 'method'>
	): Promise<TResponse>;
	put<TResponse = unknown>(
		path: string,
		options?: Omit<ApiRequestOptions, 'path' | 'method'>
	): Promise<TResponse>;
	patch<TResponse = unknown>(
		path: string,
		options?: Omit<ApiRequestOptions, 'path' | 'method'>
	): Promise<TResponse>;
	delete<TResponse = unknown>(
		path: string,
		options?: Omit<ApiRequestOptions, 'path' | 'method'>
	): Promise<TResponse>;
}

const DEFAULT_TOKEN_HEADER = 'Authorization';

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

const joinUrl = (baseUrl: string, path: string): string => {
	if (/^https?:\/\//i.test(path)) {
		return path;
	}

	if (!baseUrl) {
		if (typeof window !== 'undefined' && window.location?.origin) {
			const normalizedPath = path.startsWith('/') ? path : `/${path}`;
			return `${window.location.origin}${normalizedPath}`;
		}
		throw new Error(
			'createApiClient: baseUrl is required in non-browser environments when request path is relative'
		);
	}

	const normalizedBase = baseUrl.replace(/\/$/, '');
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${normalizedBase}${normalizedPath}`;
};

const appendQuery = (url: URL, query: QueryParams | undefined) => {
	if (!query) {
		return;
	}

	for (const [key, value] of Object.entries(query)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item !== null && item !== undefined) {
					url.searchParams.append(key, String(item));
				}
			}
			continue;
		}

		if (value !== null && value !== undefined) {
			url.searchParams.set(key, String(value));
		}
	}
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		!(value instanceof FormData)
	);
};

const withJsonBody = (body: ApiRequestOptions['body'], headers: Headers): BodyInit | undefined => {
	if (body === null || body === undefined) {
		return undefined;
	}

	if (
		typeof body === 'string' ||
		body instanceof Blob ||
		body instanceof FormData ||
		body instanceof URLSearchParams
	) {
		return body;
	}

	if (isPlainObject(body)) {
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}
		return JSON.stringify(body);
	}

	return body as BodyInit;
};

const parseResponse = async <TResponse>(response: Response): Promise<TResponse> => {
	if (response.status === 204) {
		return undefined as TResponse;
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) {
		return (await response.json()) as TResponse;
	}

	return (await response.text()) as TResponse;
};

export const createApiClient = <TEnv extends EnvLike = EnvLike>(
	options: ApiClientOptions<TEnv> = {}
): ApiClient => {
	const fetchImpl = options.fetch ?? fetch;
	const resolvedBaseUrl =
		options.baseUrl ??
		(options.baseUrlEnvKey ? getEnvValue(options.env, options.baseUrlEnvKey) : undefined) ??
		'';

	const request = async <TResponse = unknown>({
		path,
		query,
		method = 'GET',
		headers,
		body,
		...requestInit
	}: ApiRequestOptions): Promise<TResponse> => {
		const url = new URL(joinUrl(resolvedBaseUrl, path));
		appendQuery(url, query);

		const mergedHeaders = new Headers(options.headers);
		const callHeaders = new Headers(headers);
		for (const [name, value] of callHeaders.entries()) {
			mergedHeaders.set(name, value);
		}

		if (options.getToken) {
			const token = await options.getToken();
			if (token) {
				const tokenHeaderName = options.tokenHeaderName ?? DEFAULT_TOKEN_HEADER;
				const tokenPrefix = options.tokenPrefix ?? 'Bearer ';
				mergedHeaders.set(tokenHeaderName, `${tokenPrefix}${token}`);
			}
		}

		const response = await fetchImpl(url, {
			...requestInit,
			method,
			headers: mergedHeaders,
			body: withJsonBody(body, mergedHeaders)
		});

		if (!response.ok) {
			const message = `${method} ${url.toString()} failed with status ${response.status}`;
			throw new Error(message);
		}

		return parseResponse<TResponse>(response);
	};

	return {
		request,
		get: (path, requestOptions) => request({ ...requestOptions, path, method: 'GET' }),
		post: (path, requestOptions) => request({ ...requestOptions, path, method: 'POST' }),
		put: (path, requestOptions) => request({ ...requestOptions, path, method: 'PUT' }),
		patch: (path, requestOptions) => request({ ...requestOptions, path, method: 'PATCH' }),
		delete: (path, requestOptions) => request({ ...requestOptions, path, method: 'DELETE' })
	};
};
