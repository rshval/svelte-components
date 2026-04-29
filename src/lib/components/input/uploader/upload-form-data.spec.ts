import { describe, expect, it } from 'vitest';
import { createUploadFormData, extractUploadedImages } from './upload-form-data.js';

describe('upload-form-data', () => {
	it('appends all files into multipart payload for multiple upload', () => {
		const firstFile = new File(['a'], 'a.png', { type: 'image/png' });
		const secondFile = new File(['b'], 'b.png', { type: 'image/png' });

		const formData = createUploadFormData({
			fieldName: 'image',
			files: [firstFile, secondFile],
			extraFields: { fileId: 'file-1' }
		});

		expect(formData.getAll('image')).toHaveLength(2);
		expect(formData.get('fileId')).toBe('file-1');
	});

	it('extracts uploaded images from single and multiple response payloads', () => {
		expect(
			extractUploadedImages({
				image: { path: 'uploads/a.png', destination: 'uploads/', _id: 'id-1' }
			})
		).toEqual([{ path: 'uploads/a.png', destination: 'uploads/', _id: 'id-1' }]);

		expect(
			extractUploadedImages({
				images: [
					{ path: 'uploads/a.png', destination: 'uploads/', _id: 'id-1' },
					{ path: 'uploads/b.png', destination: 'uploads/', _id: 'id-2' }
				]
			})
		).toHaveLength(2);
	});
});
