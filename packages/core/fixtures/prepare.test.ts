import { beforeAll } from 'bun:test';
import path from 'node:path';
import { appLogger } from '@/global/app-logger';
import { buildApp } from '@/main/build-app';

function changeDirectory(targetDir: string) {
  try {
    const absolutePath = path.resolve(targetDir);
    console.log(absolutePath);
    process.chdir(absolutePath);
  } catch (error) {
    appLogger.error(`Error changing directory: ${error}`);
  }
}

beforeAll(async () => {
  appLogger.info('Preparing text fixtures for build tests.');
  console.log(process.cwd());
  changeDirectory('fixtures/app');
  await buildApp({ config: process.cwd(), watch: false, serve: false, build: true });
});
