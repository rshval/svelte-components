import { existsSync } from 'fs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { chromium } from 'playwright';
import { sveltekit } from '@sveltejs/kit/vite';

const browserTestsRequested = process.env.VITEST_BROWSER === '1';
const browserExecutablePath = chromium.executablePath();
const browserTestsAvailable = existsSync(browserExecutablePath);
const enableBrowserTests = browserTestsRequested || browserTestsAvailable;

if (!enableBrowserTests && process.env.VITEST_BROWSER_SKIP_NOTICE !== '1') {
	process.env.VITEST_BROWSER_SKIP_NOTICE = '1';
	console.warn(
		`[vitest] Browser tests skipped: Playwright Chromium is not installed at ${browserExecutablePath}.`
	);
}

const browserInstances = [{ browser: 'chromium' as const, headless: true }];

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		expect: { requireAssertions: true },
		projects: [
			...(enableBrowserTests
				? [
						{
							extends: './vite.config.ts',
							test: {
								name: 'client',
								browser: {
									enabled: true,
									provider: playwright(),
									instances: browserInstances
								},
								include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
								exclude: ['src/lib/server/**']
							}
						}
					]
				: []),

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
