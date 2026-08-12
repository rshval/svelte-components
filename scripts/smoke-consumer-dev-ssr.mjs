import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createServer } from 'vite';

const repoRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'svelte-components-dev-ssr-smoke-'));
const fixtureRoot = path.join(tempRoot, 'consumer');

try {
	await mkdir(path.join(fixtureRoot, 'src'), { recursive: true });
	await symlink(
		path.join(repoRoot, 'node_modules'),
		path.join(fixtureRoot, 'node_modules'),
		'junction'
	);

	await writeFile(
		path.join(fixtureRoot, 'package.json'),
		JSON.stringify(
			{
				name: 'smoke-consumer-dev-ssr',
				private: true,
				type: 'module'
			},
			null,
			2
		)
	);

	await writeFile(
		path.join(fixtureRoot, 'src', 'App.svelte'),
		`<script>
	import { Button, ImagesUploader, MapComponent } from '@rshval/svelte-components';
</script>

<Button>SSR smoke</Button>
<ImagesUploader assetsGet="/assets" assetsPost="/upload" pathPrefix="" />
<MapComponent lat={0} lng={0} zoom={1} />
`
	);

	await writeFile(
		path.join(fixtureRoot, 'src', 'entry-server.js'),
		`import { render } from 'svelte/server';
import App from './App.svelte';

export function renderApp() {
	return render(App);
}
`
	);

	const server = await createServer({
		root: fixtureRoot,
		appType: 'custom',
		logLevel: 'error',
		plugins: [svelte()],
		resolve: {
			alias: {
				'@rshval/svelte-components': repoRoot
			}
		},
		server: {
			middlewareMode: true
		}
	});

	try {
		const module = await server.ssrLoadModule('/src/entry-server.js');
		const result = module.renderApp();

		if (typeof result?.body !== 'string' || !result.body.includes('SSR smoke')) {
			throw new Error('Dev SSR smoke rendered unexpected output.');
		}

		console.log('Smoke check passed: temporary Vite consumer loaded package exports via dev SSR.');
	} finally {
		await server.close();
	}
} finally {
	await rm(tempRoot, { recursive: true, force: true });
}
