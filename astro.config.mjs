import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com/',
  integrations: [expressiveCode({
    themes: ['github-dark']
  }), mdx(), sitemap(), react(), tailwind(), vue()],
  markdown: {
    drafts: true
  }
});
