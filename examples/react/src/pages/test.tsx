import { Counter } from '@/components/counter/counter';
import { BaseLayout } from '@/layouts/base-layout';
import type { EcoPage, GetMetadata } from '@eco-pages/core';

export const getMetadata: GetMetadata = () => ({
  title: 'Home page',
  description: 'This is the test of the website',
  image: 'public/assets/images/default-og.png',
  keywords: ['typescript', 'framework', 'static'],
});

const TestPage: EcoPage = () => {
  return (
    <BaseLayout class="main-content">
      <h1 className="main-title">Eco pages</h1>
      <a href="/about">Mdx</a>
      <a href="/test">Test Splitting</a>
      <Counter defaultValue={10} />
    </BaseLayout>
  );
};

export default TestPage;
