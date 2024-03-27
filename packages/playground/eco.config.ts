import type { EcoPagesConfigInput } from "@eco-pages/core";
import tsConfig from "./tsconfig.json";

const config: EcoPagesConfigInput = {
  rootDir: import.meta.dir,
  srcDir: "src",
  pagesDir: "pages",
  globalDir: "global",
  componentsDir: "components",
  includesDir: "includes",
  baseUrl: import.meta.env.ECO_PAGES_BASE_URL!,
  tsAliases: {
    baseUrl: tsConfig.compilerOptions.baseUrl,
    paths: tsConfig.compilerOptions.paths,
  },
};

export default config;
