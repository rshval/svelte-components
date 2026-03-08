import type { ParsedQrPayload } from './types.js';

const DEFAULT_CHECK_IN_PATH = '/board/tickets/scanner';

export function parseQrPayload(
	raw: string,
	baseUrl = 'https://qr.local',
	checkInPath = DEFAULT_CHECK_IN_PATH
): ParsedQrPayload {
	const value = raw.trim();

	if (!value) {
		return {
			raw,
			kind: 'text'
		};
	}

	try {
		const url = value.startsWith('/') ? new URL(value, baseUrl) : new URL(value);
		const query = Object.fromEntries(url.searchParams.entries());
		const isCheckInPayload = normalizePath(url.pathname) === normalizePath(checkInPath);
		const ticketNumber = query.ticket || query.ticketNumber;

		return {
			raw,
			kind: isCheckInPayload ? 'check-in-link' : 'url',
			url: url.toString(),
			path: normalizePath(url.pathname),
			query,
			ticketNumber: isCheckInPayload ? ticketNumber : undefined
		};
	} catch {
		return {
			raw,
			kind: 'text'
		};
	}
}

function normalizePath(path: string): string {
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}
