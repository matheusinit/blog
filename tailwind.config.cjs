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
        'app-gray-base': '#d5d6db',
        'app-blue-base': '#343b58'
      }
    }
  },
  plugins: [require('@tailwindcss/line-clamp')],
  fontFamily: {
    sans: ['Comfortaa', 'system-ui', '-apple-system', 'Roboto'],
    serif: ['ui-serif', 'Georgia'],
    mono: [
      '"Roboto Mono"',
      '"JetBrains Mono"',
      'monospace',
      'ui-monospace',
      'Menlo',
      'Monaco',
      '"Segoe UI Mono"',
      '"Oxygen Mono"',
      '"Ubuntu Monospace"',
      '"Source Code Pro"',
      '"Fira Mono"',
      '"Droid Sans Mono"',
      '"Courier New"'
    ]
  }
};
