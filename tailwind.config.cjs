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
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',

        'primary': 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',

        'secondary': 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',

        'foreground-primary': 'hsl(var(--foreground-primary))',
        'foreground-secondary': 'hsl(var(--foreground-secondary))',
        'foreground-tertiary': 'hsl(var(--foreground-tertiary))',

        'border': 'hsl(var(--border))',
        'ring': 'hsl(var(--ring)',
        'input': 'hsl(var(--input))',
      },
      fontFamily: {
        display: ['Urbanist', 'system-ui', '-apple-system', 'Roboto'],
        sans: ['PT Sans', 'system-ui', '-apple-system', 'Roboto'],
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
