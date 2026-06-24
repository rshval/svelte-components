import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

const executablePath = chromium.executablePath();
const args = process.argv.slice(2);

if (!existsSync(executablePath)) {
	console.error('Playwright Chromium is not installed.');
	console.error('Run `pnpm exec playwright install` and retry `npm run test:browser`.');
	process.exit(1);
}

const result = spawnSync(
	process.platform === 'win32' ? 'npm.cmd' : 'npm',
	['exec', 'vitest', '--', '--project', 'client', ...args],
	{
		cwd: process.cwd(),
		stdio: 'inherit',
		env: {
			...process.env,
			VITEST_BROWSER: '1'
		}
	}
);

process.exit(result.status ?? 1);
