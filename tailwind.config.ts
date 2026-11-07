import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--bg-paper, #FAF8F5)',
        ink: 'var(--color-ink, #1E1E1E)',
        mustard: {
          DEFAULT: 'var(--color-mustard, #FFD166)',
          hover: 'var(--color-mustard-hover, #F4C44E)',
        },
        coral: {
          DEFAULT: 'var(--color-coral, #EF476F)',
          hover: 'var(--color-coral-hover, #E03660)',
        },
        mint: {
          DEFAULT: 'var(--color-mint, #06D6A0)',
          hover: 'var(--color-mint-hover, #05BF8E)',
        },
        card: 'var(--color-card, #FFFFFF)',
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px #1E1E1E',
        'neo': '4px 4px 0px #1E1E1E',
        'neo-lg': '6px 6px 0px #1E1E1E',
        'neo-xl': '8px 8px 0px #1E1E1E',
        'neo-hover': '1px 1px 0px #1E1E1E',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
