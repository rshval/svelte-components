import fs from 'node:fs';
import path from 'node:path';

const packageDir = new URL('..', import.meta.url);
const packagePath = path.join(packageDir.pathname, 'package.json');
const srcRoot = path.join(packageDir.pathname, 'src', 'lib');

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const declared = new Set([
	...Object.keys(pkg.dependencies ?? {}),
	...Object.keys(pkg.peerDependencies ?? {}),
	...Object.keys(pkg.devDependencies ?? {})
]);

const sourceFiles = [];
const walk = (dir) => {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walk(fullPath);
			continue;
		}
		if (!/\.(svelte|ts|js)$/.test(entry.name)) continue;
		if (/\.(test|spec)\.(ts|js)$/.test(entry.name)) continue;
		sourceFiles.push(fullPath);
	}
};

const stripComments = (code) =>
	code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');

const normalizePackageName = (specifier) => {
	if (specifier.startsWith('@')) {
		return specifier.split('/').slice(0, 2).join('/');
	}
	return specifier.split('/')[0];
};

const internalPrefixes = ['.', '$lib', '$app', 'svelte', 'node:'];
const imported = new Map();

walk(srcRoot);

for (const filePath of sourceFiles) {
	const source = stripComments(fs.readFileSync(filePath, 'utf8'));
	const importRegex = /(?:import|export)\s+(?:[^'"`]*?\s+from\s+)?['"]([^'"`]+)['"]/g;
	const dynamicImportRegex = /import\(\s*['"]([^'"`]+)['"]\s*\)/g;

	for (const regex of [importRegex, dynamicImportRegex]) {
		let match;
		while ((match = regex.exec(source))) {
			const specifier = match[1];
			if (internalPrefixes.some((prefix) => specifier.startsWith(prefix))) continue;
			const packageName = normalizePackageName(specifier);
			if (!imported.has(packageName)) imported.set(packageName, new Set());
			imported.get(packageName).add(path.relative(packageDir.pathname, filePath));
		}
	}
}

const missing = [...imported.keys()].filter((dep) => !declared.has(dep)).sort();

if (missing.length > 0) {
	console.error('Missing dependencies for imports in src/lib:');
	for (const dep of missing) {
		console.error(`- ${dep}`);
		for (const file of imported.get(dep)) {
			console.error(`  - ${file}`);
		}
	}
	process.exit(1);
}

console.log(`Dependency import check passed (${imported.size} external packages found).`);
