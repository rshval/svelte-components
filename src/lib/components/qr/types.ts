export type QrScannerMode = 'web' | 'capacitor';

export type QrScannerPermission = 'prompt' | 'granted' | 'denied' | 'restricted' | 'unknown';

export type QrScannerFormat = 'qr_code' | string;

export type QrPayloadKind = 'text' | 'url' | 'check-in-link';

export type ParsedQrPayload = {
	raw: string;
	kind: QrPayloadKind;
	url?: string;
	path?: string;
	query?: Record<string, string>;
	ticketNumber?: string;
};

export type QrScannerErrorCode =
	| 'permission-denied'
	| 'permission-restricted'
	| 'permission-required'
	| 'camera-unavailable'
	| 'scanner-not-supported'
	| 'scanner-not-installed'
	| 'scanner-failed';

export type QrScannerError = {
	code: QrScannerErrorCode;
	message: string;
	cause?: unknown;
};

export type CreateQrScannerOptions = {
	cooldownMs?: number;
	formats?: QrScannerFormat[];
	vibrateOnDetect?: boolean;
	beepOnDetect?: boolean;
	onDetect?: (payload: ParsedQrPayload) => void;
	onError?: (error: QrScannerError) => void;
};
