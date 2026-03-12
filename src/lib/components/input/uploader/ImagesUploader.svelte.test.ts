import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ImagesUploader from './ImagesUploader.svelte';

vi.mock('./ImagesUploaderItem.svelte', () => import('./__tests__/ImagesUploaderItem.mock.svelte'));

describe('ImagesUploader', () => {
	it('does not add unsupported files and emits onerror', async () => {
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
