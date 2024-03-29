import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

import remarkCodeTitles from 'remark-code-titles'
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com/',
  integrations: [mdx(), sitemap(), react(), tailwind()],
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkCodeTitles],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'one-dark-pro',
      wrap: true
    },
    drafts: true
  }
});
