import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // No darkMode: 'class' — we run dark-first unconditionally.
  theme: {
    extend: {
      colors: {
        // ── New brand palette ─────────────────────────────────────────────
        void:           '#0A0A0B',
        surface:        '#13131B',
        'surface-2':    '#1C1C26',
        cream:          '#F4F1EA',
        'cream-dim':    'rgba(244,241,234,0.55)',
        'cream-faint':  'rgba(244,241,234,0.25)',
        border:         'rgba(244,241,234,0.08)',
        'border-strong':'rgba(244,241,234,0.16)',
        // `lime` and `emerald` used to be flat strings, which overrides (not
        // extends) Tailwind's built-in numeric scale for those color names —
        // bg-emerald-600, text-lime-400 etc. silently emitted no CSS. Spreading
        // the real Tailwind scale back in and setting DEFAULT to the brand
        // value keeps `bg-lime`/`text-emerald` as the brand color while
        // restoring every numbered step (bg-emerald-600 on the success toast,
        // app/layout.tsx, needs the actual Tailwind emerald-600 green).
        lime: {
          ...colors.lime,
          DEFAULT: '#D4FF3F',
        },
        'lime-dim':     '#A8CC32',
        coral:          '#FF6F61',
        emerald: {
          ...colors.emerald,
          DEFAULT: '#34D399',
        },

        // ── Legacy aliases — keep OLD pages/components compiling ──────────
        // These map old class names to the nearest new token so existing
        // components render reasonably until they're refactored.
        'bg-primary':   '#0A0A0B',   // bg-bg-primary   → bg-void
        'bg-secondary': '#13131B',   // bg-bg-secondary  → bg-surface
        'bg-dark':      '#0A0A0B',   // bg-bg-dark       → bg-void
        'ink-primary':  '#F4F1EA',   // text-ink-primary → text-cream
        'ink-muted':    'rgba(244,241,234,0.55)',
        'ink-light':    'rgba(244,241,234,0.25)',
        accent:         '#D4FF3F',   // accent           → lime
        'accent-soft':  'rgba(212,255,63,0.15)',
        verified:       '#34D399',   // verified         → emerald
        bg: {
          primary:   '#0A0A0B',
          secondary: '#13131B',
          dark:      '#0A0A0B',
        },
        ink: {
          primary: '#F4F1EA',
          muted:   'rgba(244,241,234,0.55)',
          light:   'rgba(244,241,234,0.25)',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans:    ['var(--font-geist)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'Menlo', 'monospace'],
      },
      height: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      fontSize: {
        // 'display-hero' has no counterpart in globals.css — kept here.
        // display-xl/lg/md used to ALSO be defined in app/globals.css's
        // `@layer components` with different clamp() values, so
        // `text-display-xl` and `display-xl` silently rendered at different
        // sizes depending on which one a page happened to use. globals.css's
        // versions are the ones actually in use (9 call sites vs. 3), so
        // they're the surviving definition — see globals.css's
        // `@layer components` block. These three keys were deleted from here.
        'display-hero': ['clamp(3.5rem, 9vw, 9rem)', { lineHeight: '0.95', fontWeight: '300', letterSpacing: '-0.04em' }],
      },
      transitionTimingFunction: {
        vercel: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
