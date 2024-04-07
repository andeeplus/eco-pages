import path from "path";
import type { EcoPageFile, GetStaticPaths } from "@/eco-pages";
import type { Routes } from "./fs-router";

type CreateRouteArgs = {
  routePath: string;
  filePath: string;
  route: string;
};

/**
 * @class FSRouterScanner
 * @description
 * This class is responsible for scanning the file system for routes.
 * It uses the glob package to scan the file system for files with the specified file extensions.
 * It then creates a map of the routes with the pathname as the key.
 * The pathname is the route without the file extension.
 * For example, if the file is "index.tsx", the pathname will be "/index".
 * If the file is "blog/[slug].tsx", the pathname will be "/blog/[slug]".
 * If the file is "blog/[...slug].tsx", the pathname will be "/blog/[...slug]".
 */
export class FSRouterScanner {
  private dir: string;
  private origin = "";
  private templatesExt: string[];
  routes: Routes = {};

  constructor({
    dir,
    origin,
    templatesExt,
  }: {
    dir: string;
    origin: string;
    templatesExt: string[];
  }) {
    this.dir = dir;
    this.origin = origin;
    this.templatesExt = templatesExt;
  }

  private getGlobTemplatePattern() {
    return `**/*{${this.templatesExt.join(",")}}`;
  }

  private getRoutePath(path: string) {
    const fileExtensionsSet = new Set(this.templatesExt);
    let cleanedRoute = path;

    for (const ext of fileExtensionsSet) {
      cleanedRoute = cleanedRoute.replace(ext, "");
    }

    cleanedRoute = cleanedRoute.replace(/\/?index$/, "");
    return `/${cleanedRoute}`;
  }

  private async getFiles() {
    const glob = new Bun.Glob(this.getGlobTemplatePattern());
    return await Array.fromAsync(glob.scan({ cwd: this.dir }));
  }

  private getDynamicParamsNames(route: string): string[] {
    const matches = route.match(/\[.*?\]/g);
    return matches ? matches.map((match) => match.slice(1, -1)) : [];
  }

  private async createStaticDynamicRoute({
    filePath,
    route,
    routePath,
    getStaticPaths,
  }: CreateRouteArgs & { getStaticPaths: GetStaticPaths }): Promise<void> {
    const staticPaths = await getStaticPaths();

    const dynamicParamsNames = this.getDynamicParamsNames(route);

    const routesWithParams = staticPaths.paths.map((path) => {
      let routeWithParams = route;

      for (const param of dynamicParamsNames) {
        routeWithParams = routeWithParams.replace(
          `[${param}]`,
          (path.params as Record<string, string>)[param]
        );
      }

      return routeWithParams;
    });

    for (const routeWithParams of routesWithParams) {
      this.routes[routeWithParams] = {
        kind: "dynamic",
        strategy: "static",
        src: routeWithParams,
        pathname: routePath,
        filePath,
      };
    }
  }

  private async createISGDynamicRoute({
    filePath,
    route,
    routePath,
    getStaticPaths,
  }: CreateRouteArgs & { getStaticPaths?: GetStaticPaths }): Promise<void> {
    this.createSSRDynamicRoute({ filePath, route, routePath });
    if (getStaticPaths) {
      await this.createStaticDynamicRoute({ filePath, route, routePath, getStaticPaths });
    }
  }

  private createSSRDynamicRoute({ filePath, route, routePath }: CreateRouteArgs): void {
    this.routes[route] = {
      kind: "dynamic",
      strategy: "ssr",
      src: `${this.origin}${routePath}`,
      pathname: routePath,
      filePath,
    };
  }

  private async createDynamicRoute({ filePath, route, routePath }: CreateRouteArgs): Promise<void> {
    const {
      default: { renderStrategy = "ssr" },
      getStaticPaths,
      getStaticProps,
    } = (await import(filePath)) as EcoPageFile;

    switch (renderStrategy) {
      case "static": {
        if (!getStaticPaths && renderStrategy === "static") {
          throw new Error(
            `Dynamic route ${route} does not have a getStaticPaths function. Please add one.`
          );
        }

        if (!getStaticProps && renderStrategy === "static") {
          throw new Error(
            `Dynamic route ${route} does not have a getStaticProps function. Please add one.`
          );
        }

        return this.createStaticDynamicRoute({
          filePath,
          route,
          routePath,
          getStaticPaths: getStaticPaths as GetStaticPaths,
        });
      }
      case "isg":
        return this.createISGDynamicRoute({ filePath, route, routePath, getStaticPaths });
      case "ssr":
      default:
        return this.createSSRDynamicRoute({ filePath, route, routePath });
    }
  }

  private createCatchAllRoute({ filePath, route, routePath }: CreateRouteArgs): void {
    this.routes[route] = {
      kind: "catch-all",
      strategy: "ssr",
      src: `${this.origin}${routePath}`,
      pathname: routePath,
      filePath,
    };
  }

  private async createExactRoute({ filePath, route, routePath }: CreateRouteArgs): Promise<void> {
    const {
      default: { renderStrategy = "static" },
    } = (await import(filePath)) as EcoPageFile;

    this.routes[route] = {
      kind: "exact",
      strategy: renderStrategy,
      src: `${this.origin}${routePath}`,
      pathname: routePath,
      filePath,
    };
  }

  private getRouteData(file: string) {
    const routePath = this.getRoutePath(file);
    const route = `${this.origin}${routePath}`;
    const filePath = path.join(this.dir, file);
    const isDynamic = filePath.includes("[") && filePath.includes("]");
    const isCatchAll = filePath.includes("[...");

    return { route, routePath, filePath, isDynamic, isCatchAll };
  }

  async scan() {
    const scannedFiles = await this.getFiles();

    for await (const file of scannedFiles) {
      const { isCatchAll, isDynamic, ...routeData } = this.getRouteData(file);

      switch (true) {
        case isCatchAll:
          this.createCatchAllRoute(routeData);
          break;
        case isDynamic:
          await this.createDynamicRoute(routeData);
          break;
        default:
          await this.createExactRoute(routeData);
          break;
      }
    }

    return this.routes;
  }
}
