import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Strict minimal palette - Black & White ONLY
        black: '#000000',
        white: '#FFFFFF',

        // Semantic mappings
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // UI Elements
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // Neutral Grays for borders/secondary text
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        // SF Pro Display stack
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h1': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h2': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        none: '0',
        sm: '2px', // Very subtle
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        full: '9999px',
      },
      transitionDuration: {
        'micro': '150ms',
        'standard': '300ms',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Ease-in-out feel
      },
    },
  },
  plugins: [],
};

export default config;
