import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAFAF7',
          secondary: '#F2EFE8',
          dark: '#0A0A0A',
        },
        ink: {
          primary: '#0A0A0A',
          muted: '#6B6B6B',
          light: '#A8A29E',
        },
        accent: {
          DEFAULT: '#FF5A1F',
          soft: '#FFE8DE',
        },
        verified: '#1F5F3F',
        border: '#E8E4DC',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-hero': ['clamp(3.5rem, 9vw, 9rem)', { lineHeight: '0.95', fontWeight: '400', letterSpacing: '-0.04em' }],
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.02em' }],
        'h1': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.015em' }],
        'h3': ['clamp(1.25rem, 2.5vw, 1.75rem)', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'ui-lg': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ui': ['0.9375rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ui-sm': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em',
        wider: '0.04em',
        widest: '0.08em',
      },
      lineHeight: {
        display: '1.05',
        heading: '1.15',
        body: '1.75',
        ui: '1.5',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      transitionTimingFunction: {
        vercel: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
