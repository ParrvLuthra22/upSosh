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
          secondary: '#CCCCCC',
          muted: '#888888',
        },
        border: '#333333',
      },
      fontFamily: {
        // Unified JetBrains Mono typography system
        heading: ['JetBrains Mono', 'var(--font-body)', 'monospace'], // H1-H3 headings (bold)
        display: ['JetBrains Mono', 'var(--font-body)', 'monospace'], // Display text (bold)
        body: ['JetBrains Mono', 'var(--font-body)', 'monospace'],    // Body text (regular)
      },
      fontSize: {
        // Heading scale for Roboto BBH Bartle
        'display-xl': ['5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['4rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1': ['3.5rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2': ['2.5rem', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h3': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        // Body scale for JetBrains Mono
        'body-lg': ['1.05rem', { lineHeight: '1.7' }],
        'body': ['0.95rem', { lineHeight: '1.7' }],
        'body-sm': ['0.85rem', { lineHeight: '1.6' }],
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
