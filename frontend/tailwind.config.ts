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
        // Strict minimal palette - NO other colors allowed
        black: '#000000',
        white: '#FFFFFF',
        mustard: '#D4A017',
        // Semantic mappings
        background: '#000000',
        surface: '#000000',
        'surface-highlight': '#111111',
        primary: '#D4A017',
        secondary: '#D4A017',
        accent: '#D4A017',
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.8)',
          muted: 'rgba(255, 255, 255, 0.5)',
        },
        border: '#333333',
      },
      fontFamily: {
        // Award-winning typography system
        // Headings: Playfair Display - elegant serif
        serif: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        // Accent/Pixel: VT323 - retro tech feel
        pixel: ['VT323', 'monospace'],
        mono: ['VT323', 'monospace'],
        // Body/UI: Inter - clean, readable
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Display scale - Playfair Display
        'display-xl': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.02em' }],
        // Heading scale
        'h1': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.15', fontWeight: '600', letterSpacing: '-0.015em' }],
        'h3': ['clamp(1.25rem, 2.5vw, 1.75rem)', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        // Body scale - Inter
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        // Pixel/Accent scale - VT323
        'pixel-xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '0.06em' }],
        'pixel-lg': ['2rem', { lineHeight: '1.2', letterSpacing: '0.06em' }],
        'pixel': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0.05em' }],
        'pixel-sm': ['1.25rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        // UI scale - Inter
        'ui-lg': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ui': ['0.9375rem', { lineHeight: '1.5', fontWeight: '500' }],
        'ui-sm': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'normal': '0',
        'wide': '0.02em',
        'wider': '0.04em',
        'widest': '0.08em',
        'pixel': '0.05em',
      },
      lineHeight: {
        'display': '1.05',
        'heading': '1.15',
        'body': '1.75',
        'ui': '1.5',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
