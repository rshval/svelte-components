import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createServer } from 'vite';

const edgeExecutablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const repoRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'svelte-components-mapbox-smoke-'));
const fixtureRoot = path.join(tempRoot, 'consumer');

try {
	await mkdir(path.join(fixtureRoot, 'src'), { recursive: true });
	await symlink(
		path.join(repoRoot, 'node_modules'),
		path.join(fixtureRoot, 'node_modules'),
		'junction'
	);
	await writeFile(
		path.join(fixtureRoot, 'index.html'),
		'<!doctype html><div id="app"></div><script type="module" src="/src/main.js"></script>'
	);
	await writeFile(
		path.join(fixtureRoot, 'src', 'main.js'),
		"import { mount } from 'svelte'; import App from './App.svelte'; mount(App, { target: document.getElementById('app') });"
	);
	await writeFile(
		path.join(fixtureRoot, 'src', 'App.svelte'),
		`<script>
	import { MapComponent } from '@rshval/svelte-components';
	const mapStyle = { id: 'streets', value: 'mapbox/streets-v12' };
</script>

<div style="height: 300px"><MapComponent {mapStyle} accessToken="pk.test" lat={0} lng={0} zoom={1} /></div>`
	);

	const server = await createServer({
		root: fixtureRoot,
		logLevel: 'error',
		plugins: [svelte()],
		resolve: { alias: { '@rshval/svelte-components': repoRoot } },
		server: { fs: { allow: [repoRoot] } }
	});

	try {
		await server.listen();
		const browser = await chromium.launch({ executablePath: edgeExecutablePath, headless: true });
		try {
			const page = await browser.newPage();
			const pageErrors = [];
			await page.addInitScript(() => {
				const NativeWorker = window.Worker;
				window.__mapboxWorkerCount = 0;
				window.Worker = class extends NativeWorker {
					constructor(...args) {
						window.__mapboxWorkerCount += 1;
						super(...args);
					}
				};
			});
			page.on('pageerror', (error) => pageErrors.push(error.message));
			await page.goto(server.resolvedUrls.local[0], { waitUntil: 'networkidle' });
			await page.waitForFunction(() => window.__mapboxWorkerCount > 0);
			if (pageErrors.length > 0) throw new Error(pageErrors.join('\n'));
			console.log('Smoke check passed: Mapbox CSP worker starts in a Vite consumer.');
		} finally {
			await browser.close();
		}
	} finally {
		await server.close();
	}
} finally {
	await rm(tempRoot, { recursive: true, force: true });
}
