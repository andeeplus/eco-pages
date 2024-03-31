import postcss from "postcss";
import postCssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting/index.js";
import { FileUtils } from "@/utils/file-utils";
import type { CssProcessor } from "@types";

export class PostCssProcessor implements CssProcessor {
  async process(path: string) {
    const contents = await FileUtils.getPathAsString(path);

    const processor = postcss([
      postCssImport(),
      tailwindcssNesting,
      tailwindcss,
      autoprefixer,
      cssnano,
    ]);

    return await processor.process(contents, { from: path }).then((result) => result.css);
  }
}