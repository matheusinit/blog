/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'app-violet-dark': '#1a1b26',
        'app-violet-darker': '#17181f',
        'app-violet-base': '#24283b',
        'app-red-base': '#f7768e',
        'app-red-light': '#a95162',
        'app-gray-base': '#e9eaec',
        'app-gray-dark': '#dbdde7',
        'app-gray-darker': '#bec0c7'
      },
      fontFamily: {
        display: ['Comfortaa', 'system-ui', '-apple-system', 'Roboto'],
        sans: ['Source Sans Pro', 'system-ui', '-apple-system', 'Roboto'],
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
      }
    }
  },
  plugins: [require('@tailwindcss/line-clamp')],
  important: true
};
