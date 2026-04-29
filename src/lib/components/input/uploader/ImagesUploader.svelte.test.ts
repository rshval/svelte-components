import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ImagesUploader from './ImagesUploader.svelte';
import api from '$lib/plugins/api.js';

vi.mock('$lib/plugins/api.js', () => ({
	default: {
		post: vi.fn(),
		del: vi.fn()
	}
}));

vi.mock('./ImagesUploaderItem.svelte', () => import('./__tests__/ImagesUploaderItem.mock.svelte'));

const apiPostMock = vi.mocked(api.post);

describe('ImagesUploader', () => {
	it('uploads multiple images in a single multipart request without dropping files', async () => {
		apiPostMock.mockResolvedValueOnce({
			images: [
				{ path: 'uploads/a.png', destination: 'uploads/', _id: 'id-1' },
				{ path: 'uploads/b.png', destination: 'uploads/', _id: 'id-2' }
			]
		});

		const { container } = render(ImagesUploader, {
			assetsGet: '/assets/get',
			assetsPost: '/assets/post',
			pathPrefix: '',
			multiple: true
		});

		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const firstFile = new File(['a'], 'a.png', { type: 'image/png' });
		const secondFile = new File(['b'], 'b.png', { type: 'image/png' });

		await fireEvent.change(input, { target: { files: [firstFile, secondFile] } });

		await waitFor(() => {
			expect(apiPostMock).toHaveBeenCalledTimes(1);
		});

		const [, formData] = apiPostMock.mock.calls[0] as [string, FormData];
		expect(formData.getAll('image')).toHaveLength(2);

		await waitFor(() => {
			expect(screen.getAllByTestId('existing-item')).toHaveLength(2);
		});
	});

	it('does not add unsupported files and emits onerror', async () => {
		apiPostMock.mockReset();
		const onerror = vi.fn();
		const { container } = render(ImagesUploader, {
			assetsGet: '/assets/get',
			assetsPost: '/assets/post',
			pathPrefix: '',
			onerror
		});

		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const unsupportedFile = new File(['123'], 'test.webp', { type: 'image/webp' });

		await fireEvent.change(input, { target: { files: [unsupportedFile] } });

		expect(onerror).toHaveBeenCalledTimes(1);
		expect(onerror.mock.calls[0][1]).toEqual(
			expect.objectContaining({ fileName: 'test.webp', code: 'UNSUPPORTED_FORMAT' })
		);
		expect(screen.queryByTestId('new-item')).not.toBeInTheDocument();
	});

	it('removes failed upload from pending list and keeps existing items only', async () => {
		apiPostMock.mockReset();
		const onerror = vi.fn();
		const { container } = render(ImagesUploader, {
			assetsGet: '/assets/get',
			assetsPost: '/assets/post',
			pathPrefix: '',
			paths: ['uploaded/file.png'],
			ids: ['id-1'],
			onerror
		});

		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const validFile = new File(['123'], 'test.png', { type: 'image/png' });

		await fireEvent.change(input, { target: { files: [validFile] } });

		await waitFor(() => {
			expect(onerror).toHaveBeenCalledWith(
				'Server rejected file',
				expect.objectContaining({ fileName: 'test.png', code: 'SERVER_ERROR' })
			);
		});

		await waitFor(() => {
			expect(screen.queryByTestId('new-item')).not.toBeInTheDocument();
		});
		expect(screen.getAllByTestId('existing-item')).toHaveLength(1);
	});
});
