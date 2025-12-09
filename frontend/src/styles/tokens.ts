export const tokens = {
    colors: {
        light: {
            background: '#F8FAFC', // offwhite
            surface: '#E7F1FF', // pastel blue-ish
            primary: '#6366F1', // indigo
            secondary: '#22D3EE', // cyan
            text: {
                primary: '#0F172A', // slate 900
                secondary: '#334155', // slate 700
                muted: '#64748B', // slate 500
            },
            border: '#E2E8F0', // slate 200
        },
        dark: {
            background: '#0B0E12', // black/navy
            surface: '#1E293B', // slate 800
            primary: '#3B82F6', // blue 500
            secondary: '#A855F7', // purple 500
            text: {
                primary: '#F8FAFC', // slate 50
                secondary: '#CBD5E1', // slate 300
                muted: '#94A3B8', // slate 400
            },
            border: '#334155', // slate 700
        },
    },
    typography: {
        fontFamily: {
            heading: '"Poppins", "Satoshi", sans-serif',
            body: '"Inter", "Roboto", sans-serif',
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
    },
    borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        full: '9999px',
    },
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
};
