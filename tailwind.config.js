/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'color-mix(in srgb, var(--card) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'color-mix(in srgb, var(--popover) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'color-mix(in srgb, var(--primary) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--primary-foreground)',
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        secondary: {
          DEFAULT: 'color-mix(in srgb, var(--secondary) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'color-mix(in srgb, var(--muted) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'color-mix(in srgb, var(--accent) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'color-mix(in srgb, var(--destructive) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'color-mix(in srgb, var(--border) calc(100% * <alpha-value>), transparent)',
        input: 'color-mix(in srgb, var(--input) calc(100% * <alpha-value>), transparent)',
        ring: 'color-mix(in srgb, var(--ring) calc(100% * <alpha-value>), transparent)',
        sidebar: {
          DEFAULT: 'color-mix(in srgb, var(--sidebar) calc(100% * <alpha-value>), transparent)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'color-mix(in srgb, var(--sidebar-primary) calc(100% * <alpha-value>), transparent)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'color-mix(in srgb, var(--sidebar-accent) calc(100% * <alpha-value>), transparent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'color-mix(in srgb, var(--sidebar-border) calc(100% * <alpha-value>), transparent)',
          ring: 'color-mix(in srgb, var(--sidebar-ring) calc(100% * <alpha-value>), transparent)',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '1rem',
        button: '0.75rem',
      },
      keyframes: {
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.4) rotate(12deg)' },
          '50%': { opacity: '0.9', transform: 'scale(0.92) rotate(-4deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(var(--stamp-rotate, -6deg))' },
        },
        reveal: {
          '0%': { opacity: '0', filter: 'blur(6px)', transform: 'translateY(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },
        'amber-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(245, 158, 11, 0.25)' },
        },
      },
      animation: {
        stamp: 'stamp 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        reveal: 'reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'amber-pulse': 'amber-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
