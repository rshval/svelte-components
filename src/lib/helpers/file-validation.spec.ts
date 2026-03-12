import { describe, expect, it } from 'vitest';
import {
	DEFAULT_IMAGE_ACCEPT,
	FILE_VALIDATION_ERROR_CODES,
	normalizeAccept,
	validateFileByRules
} from './file-validation.js';

describe('file validation helper', () => {
	it('normalizes accept values from string and array', () => {
		expect(normalizeAccept('image/png, .jpg')).toEqual(['image/png', '.jpg']);
		expect(normalizeAccept(DEFAULT_IMAGE_ACCEPT as unknown as string[])).toEqual([
			'image/png',
			'image/jpeg'
		]);
	});

	it('rejects unsupported format', () => {
		const file = new File(['test'], 'avatar.webp', { type: 'image/webp' });
		const result = validateFileByRules(file, {
			accept: DEFAULT_IMAGE_ACCEPT as unknown as string[]
		});

		expect(result).toEqual(
			expect.objectContaining({ code: FILE_VALIDATION_ERROR_CODES.UNSUPPORTED_FORMAT })
		);
	});

	it('supports custom validation errors', () => {
		const file = new File(['test'], 'avatar.png', { type: 'image/png' });
		const result = validateFileByRules(file, {
			accept: DEFAULT_IMAGE_ACCEPT as unknown as string[],
			validateFile: () => 'Custom validation failed'
		});

		expect(result).toEqual({
			code: FILE_VALIDATION_ERROR_CODES.CUSTOM_VALIDATION_FAILED,
			message: 'Custom validation failed'
		});
	});
});
