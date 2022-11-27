import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), react(), tailwind()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    drafts: true,
    extendDefaultPlugins: true
  }
});
