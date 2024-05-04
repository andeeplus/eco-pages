import { beforeAll } from 'bun:test';
import path from 'node:path';
import { appLogger } from '@/utils/app-logger';
import { $ } from 'bun';

function changeDirectory(targetDir: string) {
  try {
    const absolutePath = path.resolve(targetDir);
    console.log(`Changing directory to: ${absolutePath}`);
    process.chdir(absolutePath);
  } catch (error) {
    appLogger.error(`Error changing directory: ${error}`);
  }
}

beforeAll(async () => {
  appLogger.info('Preparing text fixtures for build tests.');
  changeDirectory('packages/core/fixtures/app');
  await $`NODE_ENV="development" bun run ../../src/main/build-all.ts --build`;
});