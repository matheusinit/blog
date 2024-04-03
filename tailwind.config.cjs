const disabledCss = {
  'code::before': false,
  'code::after': false,
  'blockquote p:first-of-type::before': false,
  'blockquote p:last-of-type::after': false,
  pre: false,
  code: false,
  'pre code': false,
  strong: false
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'light-rose': '#F6ECEC',
        'dark-gray': '#343333',
        'light-gray': '#A9A9A9',
        'medium-gray': '#666666'
      },
      fontFamily: {
        display: ['Urbanist', 'system-ui', '-apple-system', 'Roboto'],
        sans: ['Barlow', 'system-ui', '-apple-system', 'Roboto'],
        serif: ['ui-serif', 'Georgia'],
        mono: [
          'JetBrains Mono',
          'Roboto Mono',
          'monospace',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Segoe UI Mono',
          'Oxygen Mono',
          'Ubuntu Monospace',
          'Source Code Pro',
          'Fira Mono',
          'Droid Sans Mono',
          'Courier New'
        ]
      },
      typography: {
        DEFAULT: { css: disabledCss }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
  important: true
};
