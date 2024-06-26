import { existsSync, readFileSync } from 'node:fs';
import { PostCssProcessor } from '@ecopages/postcss-processor';

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

Bun.plugin({
  name: 'bun-postcss-loader',
  setup(build) {
    const postcssFilter = /\.css/;

    build.onLoad({ filter: postcssFilter }, async (args) => {
      const text = getFileAsBuffer(args.path);
      const contents = await PostCssProcessor.processString(text);
      return {
        contents,
        exports: { default: contents },
        loader: 'object',
      };
    });
  },
});
