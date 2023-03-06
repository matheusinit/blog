/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "violet-dark": "#24283b",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
  fontFamily: {
    sans: ["Comfortaa", "system-ui", "-apple-system", "Roboto"],
    serif: ["ui-serif", "Georgia"],
    mono: [
      '"Roboto Mono"',
      '"JetBrains Mono"',
      "monospace",
      "ui-monospace",
      "Menlo",
      "Monaco",
      '"Segoe UI Mono"',
      '"Oxygen Mono"',
      '"Ubuntu Monospace"',
      '"Source Code Pro"',
      '"Fira Mono"',
      '"Droid Sans Mono"',
      '"Courier New"',
    ],
  },
};
