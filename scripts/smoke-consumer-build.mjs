import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';

const repoRoot = process.cwd();
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'svelte-components-smoke-'));
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
		`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Smoke consumer</title>
	</head>
	<body>
		<div id="app"></div>
		<script type="module" src="/src/main.js"></script>
	</body>
</html>
`
	);

	await writeFile(
		path.join(fixtureRoot, 'src', 'main.js'),
		`import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });
`
	);

	await writeFile(
		path.join(fixtureRoot, 'src', 'App.svelte'),
		`<script>
	import { InputField, InputPhone } from '@rshval/svelte-components';

	let textValue = $state('secret');
	let phoneValue = $state(undefined);
	let country = $state('RU');
	let valid = $state(true);
</script>

<div>
	<InputField label="Пароль" type="password" bind:value={textValue} />
	<InputPhone bind:value={phoneValue} bind:country={country} bind:valid={valid} />
</div>
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
			outDir: path.join(fixtureRoot, 'dist'),
			emptyOutDir: true
		}
	});

	console.log('Smoke check passed: temporary Vite consumer built published package exports.');
} finally {
	await rm(tempRoot, { recursive: true, force: true });
}
