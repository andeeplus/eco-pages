import path from 'node:path';

export const FIXTURE_PROJECT_DIR = path.resolve(import.meta.env.PWD, 'packages/core/fixtures/app');

export const FIXTURE_EXISTING_FILE_IN_DIST = 'styles/tailwind.css';

export const FIXTURE_EXISTING_FILE_GZ_IN_DIST = `${FIXTURE_EXISTING_FILE_IN_DIST}.gz`;
