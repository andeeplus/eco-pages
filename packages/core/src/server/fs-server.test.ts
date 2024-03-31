import path from "path";
import { test, expect, it, describe } from "bun:test";
import { FileSystemServer } from "./fs-server";
import { RouteRendererFactory } from "@/render/route-renderer";
import { FSRouter } from "./router/fs-router";
import { createGlobalConfig } from "@/build/create-global-config";
import { FIXTURE_EXISTING_FILE_IN_DIST } from "fixtures/constants";
import { FSRouterScanner } from "./router/fs-router-scanner";

const FIXTURE_PROJECT_DIR = path.resolve(import.meta.env.PWD, "packages/core/fixtures");

await createGlobalConfig({
  projectDir: path.resolve(FIXTURE_PROJECT_DIR),
  watchMode: false,
});

const {
  templatesExt,
  derivedPaths: { error404TemplatePath, pagesDir, distDir },
} = globalThis.ecoConfig;

const routeRendererFactory = new RouteRendererFactory();

const scanner = new FSRouterScanner({
  dir: pagesDir,
  origin: "http://localhost:3000",
  templatesExt,
});

const router = new FSRouter({
  origin: "http://localhost:3000",
  assetPrefix: distDir,
  scanner,
});

await router.init();

const server = new FileSystemServer({
  appConfig: globalThis.ecoConfig,
  router,
  routeRendererFactory,
  error404TemplatePath: error404TemplatePath,
});

describe("FileSystemServer", async () => {
  test("should return 404 for non-existent file", async () => {
    const req = new Request("http://localhost:3000/non-existent-file.css");
    const res = await server.fetch(req);

    expect(res.status).toBe(404);
  });

  test("should return 200 for existing file", async () => {
    const req = new Request("http://localhost:3000/" + FIXTURE_EXISTING_FILE_IN_DIST);
    const res = await server.fetch(req);

    expect(res.headers.get("content-type")).toBe("text/css");
    expect(res.status).toBe(200);
  });

  test("should return 200 for existing page", async () => {
    const req = new Request("http://localhost:3000");
    const res = await server.fetch(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/html");
    expect(await res.text()).toContain("Hello, world!");
  });

  test("should return 200 for existing page with query params", async () => {
    const req = new Request("http://localhost:3000?page=1");
    const res = await server.fetch(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/html");
    expect(await res.text()).toContain("{&quot;page&quot;:&quot;1&quot;}");
  });

  test("should return 200 for existing page with params", async () => {
    const req = new Request("http://localhost:3000/dynamic/123");
    const res = await server.fetch(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/html");
    expect(await res.text()).toContain("{&quot;slug&quot;:&quot;123&quot;}");
  });

  test("should return 200 for existing page with params and query params", async () => {
    const req = new Request("http://localhost:3000/dynamic/123?page=1");
    const res = await server.fetch(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/html");
    expect(await res.text()).toContain(
      "{&quot;slug&quot;:&quot;123&quot;} {&quot;page&quot;:&quot;1&quot;}"
    );
  });

  test("should return 200 for existing page with catch all params", async () => {
    const req = new Request("http://localhost:3000/catch-all/123/456");
    const res = await server.fetch(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/html");
    expect(await res.text()).toContain("{&quot;path&quot;:[&quot;123&quot;,&quot;456&quot;]}");
  });
});