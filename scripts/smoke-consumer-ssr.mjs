import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const repoRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'svelte-components-ssr-smoke-'));
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
				name: 'smoke-consumer-ssr',
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
	import { Button, ImagesUploader } from '@rshval/svelte-components';
</script>

<Button>SSR smoke</Button>
<ImagesUploader assetsGet="/assets" assetsPost="/upload" pathPrefix="" />
`
	);

	await writeFile(
		path.join(fixtureRoot, 'src', 'entry-server.js'),
		`import App from './App.svelte';

export function render() {
	return App;
}
`
	);

	await build({
		root: fixtureRoot,
		logLevel: 'error',
		plugins: [svelte()],
		resolve: {
			alias: {
				'@rshval/svelte-components': repoRoot
			}
		},
		build: {
			ssr: 'src/entry-server.js',
			outDir: path.join(fixtureRoot, 'dist-ssr'),
			emptyOutDir: true
		}
	});

	console.log('Smoke check passed: temporary Vite consumer built SSR package exports.');
} finally {
	await rm(tempRoot, { recursive: true, force: true });
}
