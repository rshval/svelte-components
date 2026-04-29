import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api.js';

const requestMock = vi.hoisted(() => vi.fn());
const storageGetMock = vi.hoisted(() => vi.fn());

vi.mock('@capacitor/core', () => ({
	CapacitorHttp: {
		request: requestMock
	}
}));

vi.mock('./storage.js', () => ({
	storageGet: storageGetMock
}));

describe('plugins/api', () => {
	beforeEach(() => {
		requestMock.mockReset();
		storageGetMock.mockReset().mockResolvedValue(null);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends json payloads through CapacitorHttp with application/json header', async () => {
		requestMock.mockResolvedValueOnce({
			status: 200,
			data: { success: true }
		});

		const result = await api.post('/api/upload', { foo: 'bar' }, 'token-1');

		expect(result).toEqual({ success: true });
		expect(requestMock).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'POST',
				url: '/api/upload',
				data: { foo: 'bar' },
				headers: expect.objectContaining({
					Authorization: 'Token token-1',
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('sends FormData through fetch without forcing application/json', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);
		vi.stubGlobal('fetch', fetchMock);

		const formData = new FormData();
		formData.append('file', new File(['hello'], 'hello.txt', { type: 'text/plain' }));

		const result = await api.post('/api/upload', formData, 'token-1');

		expect(result).toEqual({ success: true });
		expect(requestMock).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/upload');
		expect(init.body).toBe(formData);

		const headers = new Headers(init.headers);
		expect(headers.get('Authorization')).toBe('Token token-1');
		expect(headers.has('Content-Type')).toBe(false);
	});
});
