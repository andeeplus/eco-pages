import { Counter } from '@/components/counter';
import { LitCounter } from '@/components/lit-counter';
import '@/components/lit-counter/lit-counter.script';
import { LiteCounter } from '@/components/lite-counter';
import { LiteRenderer } from '@/components/lite-renderer';
import { Message } from '@/components/lite-renderer/lite-renderer.templates.kita';
import { ScriptInjector } from '@/components/script-injector';
import { BaseLayout } from '@/layouts/base-layout';
import { DepsManager, type EcoComponent, type GetMetadata } from '@eco-pages/core';

export const getMetadata: GetMetadata = () => ({
  title: 'Home page',
  description: 'This is the homepage of the website',
  image: 'public/assets/images/bun-og.png',
  keywords: ['typescript', 'framework', 'static'],
});

const HomePage: EcoComponent = () => {
  return (
    <BaseLayout class="main-content">
      <>
        <h1 class="main-title">Home</h1>
        <ScriptInjector on:interaction="mouseenter,focusin" scripts={DepsManager.extract(Counter, 'scripts').join()}>
          <Counter />
        </ScriptInjector>
        <ScriptInjector
          on:interaction="mouseenter,focusin"
          scripts={DepsManager.extract(LiteCounter, 'scripts').join()}
        >
          <LiteCounter count={5} />
        </ScriptInjector>
        <ScriptInjector on:interaction="mouseenter,focusin" scripts={DepsManager.extract(LitCounter, 'scripts').join()}>
          <LitCounter count={8} />
        </ScriptInjector>
        <LiteRenderer>
          <Message text="Hello from the server" />
        </LiteRenderer>
        <LiteRenderer replace-on-load={true} />
      </>
    </BaseLayout>
  );
};

HomePage.dependencies = DepsManager.collect({
  importMeta: import.meta,
  components: [
    BaseLayout,
    LiteRenderer,
    ScriptInjector,
    DepsManager.filter(Counter, 'stylesheets'),
    DepsManager.filter(LiteCounter, 'stylesheets'),
    DepsManager.filter(LitCounter, 'stylesheets'),
  ],
});

export default HomePage;
