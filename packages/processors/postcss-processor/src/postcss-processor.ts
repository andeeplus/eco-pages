import { existsSync, readFileSync } from 'node:fs';
import { Logger } from '@ecopages/logger';
import postcss from 'postcss';
import { defaultPlugins } from './default-plugins';

export function getFileAsBuffer(path: string): Buffer {
  try {
    if (!existsSync(path)) {
      throw new Error(`File: ${path} not found`);
    }
    return readFileSync(path);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`[ecopages] Error reading file: ${path}, ${errorMessage}`);
  }
}

const appLogger = new Logger('[@ecopages/postcss-processor]');

export interface CssProcessor {
  processPath: (path: string) => Promise<string>;
  processStringOrBuffer: (contents: string | Buffer) => Promise<string>;
}

/**
 * It processes the given path using PostCSS
 * @param path string
 * @returns string
 *
 * @example
 * ```ts
 * PostCssProcessor.processPath('path/to/file.css').then((processedCss) => {
 * console.log(processedCss);
 * });
 */
async function processPath(path: string) {
  const contents = getFileAsBuffer(path);

  const processor = postcss(defaultPlugins);

  try {
    return await processor.process(contents, { from: path }).then((result) => result.css);
  } catch (error) {
    appLogger.error('processPath | Error processing PostCSS', error);
    return '';
  }
}

/**
 * It processes the given string or buffer using PostCSS
 * @param contents string | Buffer
 * @returns string
 *
 * @example
 * ```ts
 * const css = `body { @apply bg-blue-500; }`;
 *
 * PostCssProcessor.processString(css).then((processedCss) => {
 * console.log(processedCss);
 * });
 * ```
 */
async function processStringOrBuffer(contents: string | Buffer) {
  const processor = postcss(defaultPlugins);
  try {
    return await processor.process(contents, { from: undefined }).then((result) => result.css);
  } catch (error) {
    appLogger.error('processStringOrBuffer | Error processing PostCSS', error);
    return '';
  }
}

/**
 * PostCSS Processor
 * - processPath: It processes the given path using PostCSS
 * - processString: It processes the given string or buffer using PostCSS
 */
export const PostCssProcessor: CssProcessor = {
  processPath,
  processStringOrBuffer,
};
