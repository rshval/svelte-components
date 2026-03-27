import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './create-api-client.js';

describe('createApiClient', () => {
	it('resolves base url from env and sends json payload', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const client = createApiClient({
			env: { PUBLIC_API_URL: 'https://api.example.com' },
			baseUrlEnvKey: 'PUBLIC_API_URL',
			fetch: fetchMock,
			getToken: () => 'token-1'
		});

		const result = await client.post<{ ok: boolean }>('/v1/ping', {
			body: { message: 'hello' }
		});

		expect(result.ok).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
		expect(url.toString()).toBe('https://api.example.com/v1/ping');
		expect(init.method).toBe('POST');
		expect((init.headers as Headers).get('Authorization')).toBe('Bearer token-1');
		expect((init.headers as Headers).get('Content-Type')).toBe('application/json');
		expect(init.body).toBe('{"message":"hello"}');
	});

	it('appends query params', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const client = createApiClient({
			baseUrl: 'https://api.example.com',
			fetch: fetchMock
		});

		await client.get('/v1/items', {
			query: { page: 1, filter: ['active', 'vip'], empty: null }
		});

		const [url] = fetchMock.mock.calls[0] as [URL];
		expect(url.toString()).toBe('https://api.example.com/v1/items?page=1&filter=active&filter=vip');
	});
});
