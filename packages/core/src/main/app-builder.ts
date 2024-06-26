import { exec } from 'node:child_process';
import path from 'node:path';

import '@/global/init';

import { BunFileSystemServerAdapter } from '@/adapters/bun/fs-server';
import { StaticContentServer } from '@/adapters/bun/sc-server';
import { appLogger } from '@/global/app-logger';
import { CssBuilder } from '@/main/css-builder';
import { ProjectWatcher } from '@/main/watcher';
import { FileUtils } from '@/utils/file-utils.module';
import { PostCssProcessor } from '@ecopages/postcss-processor';

import type { IntegrationManager } from '@/main/integration-manager';
import type { ScriptsBuilder } from '@/main/scripts-builder';
import type { Server } from 'bun';
import type { AppConfigurator } from './app-configurator';
import type { StaticPageGenerator } from './static-page-generator';

type AppBuilderOptions = {
  watch: boolean;
  serve: boolean;
  build: boolean;
};

export class AppBuilder {
  appConfigurator: AppConfigurator;
  integrationManger: IntegrationManager;
  staticPageGenerator: StaticPageGenerator;
  cssBuilder: CssBuilder;
  scriptsBuilder: ScriptsBuilder;
  options: AppBuilderOptions;

  constructor({
    appConfigurator,
    integrationManger,
    staticPageGenerator,
    cssBuilder,
    scriptsBuilder,
    options,
  }: {
    appConfigurator: AppConfigurator;
    integrationManger: IntegrationManager;
    staticPageGenerator: StaticPageGenerator;
    cssBuilder: CssBuilder;
    scriptsBuilder: ScriptsBuilder;
    options: AppBuilderOptions;
  }) {
    this.appConfigurator = appConfigurator;
    this.integrationManger = integrationManger;
    this.staticPageGenerator = staticPageGenerator;
    this.cssBuilder = cssBuilder;
    this.scriptsBuilder = scriptsBuilder;
    this.options = options;
  }

  prepareDistDir() {
    FileUtils.ensureFolderExists(this.appConfigurator.config.distDir, true);
  }

  copyPublicDir() {
    const { srcDir, publicDir, distDir } = this.appConfigurator.config;
    FileUtils.copyDirSync(path.join(srcDir, publicDir), path.join(distDir, publicDir));
  }

  execTailwind() {
    const { srcDir, distDir, tailwind } = this.appConfigurator.config;
    const input = `${srcDir}/${tailwind.input}`;
    const output = `${distDir}/${tailwind.input}`;
    const watch = this.options.watch;
    const minify = !watch;
    exec(`bunx tailwindcss -i ${input} -o ${output} ${watch ? '--watch' : ''} ${minify ? '--minify' : ''}`);
  }
  private async runDevServer() {
    const options = {
      appConfig: this.appConfigurator.config,
      options: { watchMode: this.options.watch },
    };
    await BunFileSystemServerAdapter.create(options);
  }

  async serve() {
    await this.runDevServer();
  }

  async watch() {
    this.runDevServer();

    const cssBuilder = new CssBuilder({
      processor: PostCssProcessor,
      config: this.appConfigurator.config,
    });

    const watcherInstance = new ProjectWatcher(this.appConfigurator.config, cssBuilder, this.scriptsBuilder);
    await watcherInstance.createWatcherSubscription();
  }

  serveStatic() {
    const { server } = StaticContentServer.create({
      appConfig: this.appConfigurator.config,
      options: {
        watchMode: this.options.watch,
      },
    });

    appLogger.info(`Preview running at http://localhost:${(server as Server).port}`);
  }

  async buildStatic() {
    await this.staticPageGenerator.run();
    if (this.options.build) {
      appLogger.info('Build completed');
      process.exit(0);
    }

    this.serveStatic();
  }

  async run() {
    const { distDir } = this.appConfigurator.config;

    this.prepareDistDir();
    this.copyPublicDir();

    this.execTailwind();

    await this.cssBuilder.build();
    await this.scriptsBuilder.build();
    await this.integrationManger.prepareDependencies();

    this.appConfigurator.registerIntegrationsDependencies(this.integrationManger.dependencies);

    if (this.options.watch) {
      return await this.watch();
    }

    FileUtils.gzipDirSync(distDir, ['css', 'js']);

    if (this.options.serve) {
      return await this.serve();
    }

    return await this.buildStatic();
  }
}
