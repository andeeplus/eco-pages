import { Head } from '@/includes/head.kita';
import type { EcoComponent, HtmlTemplateProps } from '@eco-pages/core';

const HtmlTemplate: EcoComponent<HtmlTemplateProps> = ({
  children,
  metadata,
  dependencies,
  headContent,
  language = 'en',
}) => {
  return (
    <html lang={language} class="dark">
      <Head metadata={metadata} dependencies={dependencies}>
        {headContent}
      </Head>
      {children}
    </html>
  );
};

export default HtmlTemplate;
