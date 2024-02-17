import {
  type DefaultTemplateFormats,
  type EcoPagesConfig,
  type RenderRouteConfig,
} from "root/lib/eco-pages.types";
import type { BunPlugin } from "bun";
import { createKitaRoute } from "./templates/create-kita-route";
import path from "node:path";

export function getHtmlPath({ file, pagesDir }: { file: string; pagesDir: string }) {
  let startIndex = file.indexOf(pagesDir) + pagesDir.length;
  let endIndex = file.lastIndexOf("/");
  let path = file.substring(startIndex, endIndex);
  if (path === "/index") return "";
  return path;
}

export async function createRouteConfig({
  file,
  config,
}: {
  file: string;
  config: EcoPagesConfig;
}): Promise<RenderRouteConfig> {
  const renderType = file.split(".").at(-2) as DefaultTemplateFormats;

  switch (renderType) {
    case "kita":
      return await createKitaRoute({ file, config });
    default:
      throw new Error(`Unknown render type: ${renderType}`);
  }
}

export function buildHtmlPages({ config }: { config: Required<EcoPagesConfig> }): BunPlugin {
  return {
    name: "Build Eco Pages",
    setup(build) {
      build.onLoad({ filter: /\.tsx$/ }, async (args) => {
        const route = await createRouteConfig({
          file: args.path,
          config,
        });

        const docType = "<!DOCTYPE html>";
        const htmlPath = getHtmlPath({
          file: args.path,
          pagesDir: path.join(config.srcDir, config.pagesDir),
        });

        const relativeUrl = `${htmlPath}/index.html`;
        const distPath = `${config.distDir}${relativeUrl}`;
        const htmlPage = docType + route.html.toString();

        await Bun.write(distPath, htmlPage);

        return {
          then(onresolved, onrejected) {
            if (onresolved) onresolved({ contents: htmlPage, loader: "text" });
            if (onrejected) onrejected((reason: any) => console.error(reason));
          },
        };
      });
    },
  };
}
