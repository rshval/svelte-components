import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const requiredDistFiles = [
	'dist/index.js',
	'dist/index.d.ts',
	'dist/helpers/index.js',
	'dist/helpers/index.d.ts',
	'dist/plugins/index.js',
	'dist/plugins/index.d.ts',
	'dist/stores/index.js',
	'dist/stores/index.d.ts',
	'dist/constants.js',
	'dist/constants.d.ts'
];

const missing = [];
for (const file of requiredDistFiles) {
	try {
		await access(resolve(process.cwd(), file));
	} catch {
		missing.push(file);
	}
}

if (missing.length > 0) {
	console.error('Missing packaged exports artifacts:');
	for (const file of missing) console.error(`- ${file}`);
	process.exit(1);
}

console.log('Smoke check passed: all expected export artifacts exist in dist/.');
