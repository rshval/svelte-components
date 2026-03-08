import { describe, expect, it } from 'vitest';
import { parseQrPayload } from './parse-qr-payload.js';

describe('parseQrPayload', () => {
	it('parses check-in deep-link and extracts ticketNumber', () => {
		const payload = parseQrPayload('/board/tickets/scanner?ticket=EVT-001');

		expect(payload.kind).toBe('check-in-link');
		expect(payload.ticketNumber).toBe('EVT-001');
		expect(payload.path).toBe('/board/tickets/scanner');
	});

	it('parses generic URL payload', () => {
		const payload = parseQrPayload('https://example.com/public?id=42');

		expect(payload.kind).toBe('url');
		expect(payload.query).toEqual({ id: '42' });
		expect(payload.ticketNumber).toBeUndefined();
	});

	it('falls back to plain text payload', () => {
		const payload = parseQrPayload('plain ticket text');

		expect(payload.kind).toBe('text');
		expect(payload.url).toBeUndefined();
	});
});
