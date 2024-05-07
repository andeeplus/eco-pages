import { DepsManager, type EcoComponent } from '@eco-pages/core';
import { type BundledLanguage, type BundledTheme, codeToHtml } from 'shiki';

export const CodeBlock: EcoComponent<{ children: string; lang?: BundledLanguage; theme?: BundledTheme }> = async ({
  children,
  lang = 'typescript',
  theme = 'vitesse-dark',
}) => {
  const safeHtml = await codeToHtml(children, {
    lang,
    theme,
  });

  return <div class="code-block">{safeHtml}</div>;
};

CodeBlock.dependencies = DepsManager.collect({ importMeta: import.meta });
