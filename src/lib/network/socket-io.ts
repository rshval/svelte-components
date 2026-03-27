import type { ManagerOptions, SocketOptions } from 'socket.io-client';
import type { EnvLike } from './types.js';

const SOCKET_TRANSPORTS = ['websocket', 'polling', 'webtransport'] as const;
type SocketTransport = (typeof SOCKET_TRANSPORTS)[number];

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

export interface CreateSocketIoConnectionConfigOptions {
	isProduction: boolean;
}

export type SocketIoConnectionConfig = Pick<
	ManagerOptions & SocketOptions,
	'withCredentials' | 'transports'
>;

const normalizeTransport = (value: string): SocketTransport | null => {
	if ((SOCKET_TRANSPORTS as readonly string[]).includes(value)) {
		return value as SocketTransport;
	}

	return null;
};

const parseBooleanEnv = (rawValue: string | undefined, envKey: string): boolean | undefined => {
	if (!rawValue) {
		return undefined;
	}

	const normalized = rawValue.trim().toLowerCase();
	if (TRUE_VALUES.has(normalized)) {
		return true;
	}

	if (FALSE_VALUES.has(normalized)) {
		return false;
	}

	throw new Error(
		`createSocketIoConnectionConfig: ${envKey} must be a boolean-like value (true/false/1/0/on/off/yes/no)`
	);
};

const parseTransports = (rawValue: string | undefined): SocketTransport[] | undefined => {
	if (!rawValue) {
		return undefined;
	}

	const values = rawValue
		.split(',')
		.map((item) => item.trim().toLowerCase())
		.filter(Boolean);

	if (!values.length) {
		return undefined;
	}

	const invalidValues: string[] = [];
	const transports: SocketTransport[] = [];

	for (const value of values) {
		const normalized = normalizeTransport(value);
		if (!normalized) {
			invalidValues.push(value);
			continue;
		}

		if (!transports.includes(normalized)) {
			transports.push(normalized);
		}
	}

	if (invalidValues.length) {
		throw new Error(
			`createSocketIoConnectionConfig: VITE_SOCKET_TRANSPORTS has unsupported values: ${invalidValues.join(', ')}`
		);
	}

	return transports;
};

export const createSocketIoConnectionConfig = <TEnv extends EnvLike>(
	env: TEnv,
	{ isProduction }: CreateSocketIoConnectionConfigOptions
): SocketIoConnectionConfig => {
	const withCredentials = parseBooleanEnv(
		env.VITE_SOCKET_WITH_CREDENTIALS,
		'VITE_SOCKET_WITH_CREDENTIALS'
	);
	const transports = parseTransports(env.VITE_SOCKET_TRANSPORTS);

	return {
		withCredentials: withCredentials ?? isProduction,
		transports: transports ?? (isProduction ? ['websocket'] : ['websocket', 'polling'])
	};
};
