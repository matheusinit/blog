import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import expressiveCode from 'astro-expressive-code';

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com/',
  integrations: [expressiveCode({
    themes: ['github-dark']
  }), mdx(), sitemap(), tailwind(), vue(), tailwind({
    applyBaseStyles: false
  }), react()],
  markdown: {
    drafts: true
  }
});