/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{html,js,jsx,ts,tsx,mdx}',
  ],
  presets: [require('nativewind/preset')],
  important: 'html',
  theme: {
    extend: {
      colors: {
        foreground: 'rgb(var(--foreground)/<alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
        },
        border: 'rgb(var(--border)/<alpha-value>)',
        input: 'rgb(var(--input)/<alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        white: 'rgb(255 255 255)',
        primary: {
          DEFAULT: 'rgb(var(--primary)/<alpha-value>)',
          foreground: 'rgb(var(--primary-foreground)/<alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary)/<alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground)/<alpha-value>)',
        },
        background: {
          DEFAULT: 'rgb(var(--background)/<alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent)/<alpha-value>)',
          foreground: 'rgb(var(--accent-foreground)/<alpha-value>)',
        },
      },
      fontFamily: {
        heading: undefined,
        body: 'var(--font-sans)',
        mono: 'var(--font-mono)',
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
      },
      fontSize: {
        '2xs': '10px',
      },
    },
  },
};
