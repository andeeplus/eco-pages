import { LitCounter } from '@/components/lit-counter';
import { BaseLayout } from '@/layouts/base-layout';
import type { EcoPage, GetMetadata, PageProps } from '@ecopages/core';

export const getMetadata: GetMetadata = () => ({
  title: 'Home page',
  description: 'This is the homepage of the website',
  image: 'public/assets/images/default-og.png',
  keywords: ['typescript', 'framework', 'static'],
});

const HomePage: EcoPage<PageProps> = ({ params, query }) => {
  return (
    <BaseLayout class="main-content">
      <>
        <h1 class="main-title">Home Page</h1>
        <p safe>{JSON.stringify(query || [])}</p>
        <lit-counter class="lit-counter" count={8}></lit-counter>
      </>
    </BaseLayout>
  );
};

HomePage.config = {
  importMeta: import.meta,
  dependencies: {
    stylesheets: ['./index.css'],
    components: [BaseLayout, LitCounter],
  },
};

export default HomePage;
