export const DEFAULT_IMAGE_ACCEPT = ['image/png', 'image/jpeg'] as const;

export const FILE_VALIDATION_ERROR_CODES = {
	UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
	FILE_TOO_LARGE: 'FILE_TOO_LARGE',
	CUSTOM_VALIDATION_FAILED: 'CUSTOM_VALIDATION_FAILED'
} as const;

export type FileValidationErrorCode =
	(typeof FILE_VALIDATION_ERROR_CODES)[keyof typeof FILE_VALIDATION_ERROR_CODES];

export const FILE_VALIDATION_ERROR_MESSAGES = {
	UNSUPPORTED_FORMAT: 'Unsupported file format.',
	FILE_TOO_LARGE: 'File size exceeds the allowed limit.',
	CUSTOM_VALIDATION_FAILED: 'File did not pass validation.'
} as const;

export interface FileValidationContext {
	accept?: string | string[];
	maxFileSizeMb?: number;
	validateFile?: (file: File) => string | null;
}

export interface FileValidationError {
	code: FileValidationErrorCode;
	message: string;
}

export function normalizeAccept(accept?: string | string[]): string[] {
	if (!accept) {
		return [];
	}

	const rawValues = Array.isArray(accept) ? accept : [accept];

	return rawValues
		.flatMap((value) => value.split(','))
		.map((value) => value.trim().toLowerCase())
		.filter(Boolean);
}

export function isFileAccepted(file: File, acceptValues: string[]): boolean {
	if (!acceptValues.length) {
		return true;
	}

	const fileName = file.name.toLowerCase();
	const fileType = file.type.toLowerCase();

	return acceptValues.some((acceptValue) => {
		if (acceptValue.startsWith('.')) {
			return fileName.endsWith(acceptValue);
		}

		if (acceptValue.endsWith('/*')) {
			const [acceptType] = acceptValue.split('/');
			const [fileMainType] = fileType.split('/');
			return acceptType === fileMainType;
		}

		return fileType === acceptValue;
	});
}

export function validateFileByRules(
	file: File,
	{ accept, maxFileSizeMb, validateFile }: FileValidationContext
): FileValidationError | null {
	const normalizedAccept = normalizeAccept(accept);
	if (!isFileAccepted(file, normalizedAccept)) {
		return {
			code: FILE_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT,
			message: FILE_VALIDATION_ERROR_MESSAGES.UNSUPPORTED_FORMAT
		};
	}

	if (typeof maxFileSizeMb === 'number' && maxFileSizeMb > 0) {
		const fileSizeMb = file.size / (1024 * 1024);
		if (fileSizeMb > maxFileSizeMb) {
			return {
				code: FILE_VALIDATION_ERROR_CODES.FILE_TOO_LARGE,
				message: `${FILE_VALIDATION_ERROR_MESSAGES.FILE_TOO_LARGE} Max: ${maxFileSizeMb} MB.`
			};
		}
	}

	if (validateFile) {
		const validationResult = validateFile(file);
		if (validationResult) {
			return {
				code: FILE_VALIDATION_ERROR_CODES.CUSTOM_VALIDATION_FAILED,
				message: validationResult || FILE_VALIDATION_ERROR_MESSAGES.CUSTOM_VALIDATION_FAILED
			};
		}
	}

	return null;
}
