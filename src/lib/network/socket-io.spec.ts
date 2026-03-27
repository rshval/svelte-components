import { describe, expect, it } from 'vitest';
import { createSocketIoConnectionConfig } from './socket-io.js';

describe('createSocketIoConnectionConfig', () => {
	it('returns explicit env values for withCredentials and transports', () => {
		const config = createSocketIoConnectionConfig(
			{
				VITE_SOCKET_WITH_CREDENTIALS: 'true',
				VITE_SOCKET_TRANSPORTS: 'websocket, polling, websocket'
			},
			{ isProduction: false }
		);

		expect(config).toEqual({
			withCredentials: true,
			transports: ['websocket', 'polling']
		});
	});

	it('uses production defaults when env vars are missing', () => {
		const config = createSocketIoConnectionConfig({}, { isProduction: true });

		expect(config).toEqual({
			withCredentials: true,
			transports: ['websocket']
		});
	});

	it('throws on unsupported transport values', () => {
		expect(() =>
			createSocketIoConnectionConfig(
				{
					VITE_SOCKET_TRANSPORTS: 'websocket,sse'
				},
				{ isProduction: true }
			)
		).toThrow(/VITE_SOCKET_TRANSPORTS has unsupported values: sse/);
	});

	it('throws on invalid withCredentials value', () => {
		expect(() =>
			createSocketIoConnectionConfig(
				{
					VITE_SOCKET_WITH_CREDENTIALS: 'maybe'
				},
				{ isProduction: true }
			)
		).toThrow(/VITE_SOCKET_WITH_CREDENTIALS must be a boolean-like value/);
	});
});
