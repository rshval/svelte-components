import { describe, expect, it, vi } from 'vitest';
import { createSocketClient } from './create-socket-client.js';

class MockWebSocket {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSING = 2;
	static readonly CLOSED = 3;

	readyState = MockWebSocket.CONNECTING;
	onopen: ((event: Event) => void) | null = null;
	onclose: ((event: CloseEvent) => void) | null = null;
	onerror: ((event: Event) => void) | null = null;
	onmessage: ((event: MessageEvent<string>) => void) | null = null;
	sent: string[] = [];

	constructor(public readonly url: string) {}

	send(data: string) {
		this.sent.push(data);
	}

	close() {
		this.readyState = MockWebSocket.CLOSED;
	}

	open() {
		this.readyState = MockWebSocket.OPEN;
		this.onopen?.(new Event('open'));
	}

	emitMessage(raw: string) {
		this.onmessage?.(new MessageEvent('message', { data: raw }));
	}
}

describe('createSocketClient', () => {
	it('handles typed events and outgoing messages', () => {
		type Incoming = {
			connected: { id: string };
		};
		type Outgoing = {
			ping: { at: number };
		};

		let wsInstance: MockWebSocket | null = null;
		const client = createSocketClient<Incoming, Outgoing>({
			url: 'wss://socket.example.com',
			webSocketFactory: (url) => {
				wsInstance = new MockWebSocket(url);
				return wsInstance as unknown as WebSocket;
			}
		});

		const listener = vi.fn();
		client.on('connected', listener);

		const socket = client.connect();
		expect((socket as unknown as MockWebSocket).url).toBe('wss://socket.example.com');

		wsInstance?.open();
		client.emit('ping', { at: 10 });
		expect(wsInstance?.sent[0]).toBe('{"type":"ping","payload":{"at":10}}');

		wsInstance?.emitMessage('{"type":"connected","payload":{"id":"u1"}}');
		expect(listener).toHaveBeenCalledWith({ id: 'u1' });
		expect(client.isConnected()).toBe(true);

		client.disconnect();
		expect(wsInstance?.readyState).toBe(MockWebSocket.CLOSED);
	});
});
