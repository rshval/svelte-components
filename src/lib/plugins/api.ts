/*
	This module is used by the /pages endpoint to
	make calls to api
*/
/**
 * модуль api использует fetch для http|https запросов
 * (не изучена кросплатформенность web|ios|android)
 */

import type { HttpResponse } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
import { storageGet } from './storage.js';
import type { GetResult } from '@capacitor/preferences';

async function send({
	method,
	path,
	data,
	token,
	controller
}: {
	method: string;
	path: string;
	data?: Record<string, unknown> | FormData;
	token?: string;
	controller?: AbortController;
}) {
	const opts: Api.Opts = { method, headers: {} };
	if (data) {
		opts.headers['Content-Type'] = 'application/json';
		opts.data = data;
	}

	if (token) {
		opts.headers['Authorization'] = `Token ${token}`;
	} else {
		const dc1_auth_key: GetResult | null = await storageGet('dc1_auth_key');
		if (dc1_auth_key?.value) {
			opts.headers['Authorization'] = `Token ${dc1_auth_key.value}`;
		}
	}
	if (controller) {
		opts.signal = controller.signal;
	}

	let res: HttpResponse;
	try {
		res = await CapacitorHttp.request({ ...opts, url: path });
		if (res.status === 200 || res.status === 422) {
			return res.data;
		} else {
			return res;
		}
	} catch (err: unknown) {
		if (err instanceof Error) {
			if (err?.name == 'AbortError') {
				return { aborted: true };
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
}

export function get(path: string, token?: string, controller?: AbortController) {
	return send({ method: 'GET', path, token, controller });
}

export function post(
	path: string,
	data: Record<string, unknown> | FormData,
	token?: string,
	controller?: AbortController
) {
	return send({ method: 'POST', path, data, token, controller });
}

export function del(path: string, token?: string, controller?: AbortController) {
	return send({ method: 'DELETE', path, token, controller });
}

export function patch(
	path: string,
	data: Record<string, unknown> | FormData,
	token: string,
	controller?: AbortController
) {
	return send({ method: 'PATCH', path, data, token, controller });
}

export function put(
	path: string,
	data: Record<string, unknown>,
	token: string,
	controller?: AbortController
) {
	return send({ method: 'PUT', path, data, token, controller });
}

export default {
	get: get,
	del: del,
	patch: patch,
	post: post,
	put: put
};
