import fs from 'node:fs';
import path from 'node:path';
import { invariant } from '@/global/utils';
import { kitaPlugin } from '@/integrations/kita/kita.plugin';
import { litPlugin } from '@/integrations/lit/lit.plugin';
import { appLogger } from '@/utils/app-logger';
import type { EcoPagesConfig, EcoPagesConfigInput } from '@types';

export class ConfigBuilder {
  config: EcoPagesConfig;

  static defaultConfig: Omit<EcoPagesConfig, 'baseUrl' | 'absolutePaths' | 'templatesExt' | 'serve'> = {
    rootDir: '.',
    srcDir: 'src',
    pagesDir: 'pages',
    includesDir: 'includes',
    componentsDir: 'components',
    layoutsDir: 'layouts',
    publicDir: 'public',
    includesTemplates: {
      head: 'head.kita.tsx',
      html: 'html.kita.tsx',
      seo: 'seo.kita.tsx',
    },
    error404Template: '404.kita.tsx',
    robotsTxt: {
      preferences: {
        '*': [],
        Googlebot: ['/public/'],
      },
    },
    tailwind: {
      input: 'styles/tailwind.css',
    },
    integrations: [kitaPlugin, litPlugin],
    distDir: '.eco',
    scriptDescriptor: 'script',
  };

  constructor({
    projectDir,
    customConfig,
  }: {
    projectDir: string;
    customConfig: EcoPagesConfigInput;
  }) {
    invariant(customConfig.baseUrl, 'baseUrl is required in the config');
    invariant(customConfig.rootDir, 'rootDir is required in the config');

    const baseConfig = this.mergeConfig(ConfigBuilder.defaultConfig, customConfig);

    const descriptors = baseConfig.integrations.map((integration) => integration.descriptor);
    const uniqueDescriptors = new Set(descriptors);
    invariant(descriptors.length === uniqueDescriptors.size, 'Integrations must have unique descriptors');

    this.config = {
      ...baseConfig,
      templatesExt: this.buildTemplatesExt(baseConfig.integrations),
      absolutePaths: this.getAbsolutePaths(projectDir, baseConfig),
    };

    globalThis.ecoConfig = this.config;

    appLogger.debug('Config', this.config);
  }

  private buildTemplatesExt(integrations: EcoPagesConfig['integrations']): string[] {
    const formatExtension = (integration: any) => (ext: string) => `.${integration.descriptor}.${ext}`;
    return integrations.flatMap((integration) => integration.extensions.map(formatExtension(integration)));
  }

  private getAbsolutePaths(
    projectDir: string,
    config: Omit<EcoPagesConfig, 'absolutePaths' | 'templatesExt'>,
  ): EcoPagesConfig['absolutePaths'] {
    const {
      srcDir,
      componentsDir,
      includesDir,
      layoutsDir,
      pagesDir,
      publicDir,
      distDir,
      includesTemplates,
      error404Template,
    } = config;

    const absoluteSrcDir = path.resolve(projectDir, srcDir);
    const absoluteDistDir = path.resolve(projectDir, distDir);

    return {
      projectDir: projectDir,
      srcDir: absoluteSrcDir,
      distDir: absoluteDistDir,
      componentsDir: path.join(absoluteSrcDir, componentsDir),
      includesDir: path.join(absoluteSrcDir, includesDir),
      layoutsDir: path.join(absoluteSrcDir, layoutsDir),
      pagesDir: path.join(absoluteSrcDir, pagesDir),
      publicDir: path.join(absoluteSrcDir, publicDir),
      htmlTemplatePath: path.join(absoluteSrcDir, includesDir, includesTemplates.html),
      error404TemplatePath: path.join(absoluteSrcDir, pagesDir, error404Template),
    };
  }

  private mergeConfig(
    baseConfig: Omit<EcoPagesConfig, 'baseUrl' | 'absolutePaths' | 'serve' | 'templatesExt'>,
    customConfig: EcoPagesConfigInput,
  ): Omit<EcoPagesConfig, 'absolutePaths' | 'templatesExt'> {
    return {
      ...baseConfig,
      ...customConfig,
      includesTemplates: {
        ...baseConfig.includesTemplates,
        ...(customConfig?.includesTemplates ?? {}),
      },
      robotsTxt: {
        ...baseConfig.robotsTxt,
        ...(customConfig?.robotsTxt ?? {}),
        preferences: {
          ...baseConfig.robotsTxt.preferences,
          ...(customConfig.robotsTxt?.preferences ?? {}),
        },
      },
      tailwind: {
        ...baseConfig.tailwind,
        ...customConfig.tailwind,
      },
      integrations: [...baseConfig.integrations, ...(customConfig.integrations ?? [])],
    };
  }

  static async create({ projectDir }: { projectDir: string }): Promise<EcoPagesConfig> {
    if (!fs.existsSync(`${projectDir}/eco.config.ts`)) {
      throw new Error('eco.config.ts not found, please provide a valid config file.');
    }

    const { default: customConfig } = await import(`${projectDir}/eco.config.ts`);

    return new ConfigBuilder({
      projectDir,
      customConfig,
    }).config;
  }
}