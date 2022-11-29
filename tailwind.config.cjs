/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {}
  },
  plugins: [require('@tailwindcss/line-clamp')],
  fontFamily: {
    sans: [
      'system-ui',
      '-apple-system',
      'Roboto',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"'
    ],
    serif: ['ui-serif', 'Georgia'],
    mono: [
      '"Cascadia Mono"',
      '"JetBrains Mono"',
      'monospace',
      'ui-monospace',
      'Menlo',
      'Monaco',
      '"Segoe UI Mono"',
      '"Roboto Mono"',
      '"Oxygen Mono"',
      '"Ubuntu Monospace"',
      '"Source Code Pro"',
      '"Fira Mono"',
      '"Droid Sans Mono"',
      '"Courier New"'
    ]
  }
};
