import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['clamp(0.65rem, 0.62rem + 0.15vw, 0.75rem)',  { lineHeight: '1rem' }],
        'sm':   ['clamp(0.74rem, 0.70rem + 0.20vw, 0.875rem)', { lineHeight: '1.2rem' }],
        'base': ['clamp(0.80rem, 0.74rem + 0.30vw, 1rem)',     { lineHeight: '1.45rem' }],
        'lg':   ['clamp(0.86rem, 0.78rem + 0.40vw, 1.125rem)', { lineHeight: '1.55rem' }],
        'xl':   ['clamp(0.92rem, 0.82rem + 0.50vw, 1.25rem)',  { lineHeight: '1.5' }],
        '2xl':  ['clamp(1.00rem, 0.86rem + 0.70vw, 1.5rem)',   { lineHeight: '1.4' }],
        '3xl':  ['clamp(1.10rem, 0.92rem + 0.95vw, 1.875rem)', { lineHeight: '1.35' }],
        '4xl':  ['clamp(1.25rem, 1.00rem + 1.30vw, 2.25rem)',  { lineHeight: '1.25' }],
        '5xl':  ['clamp(1.45rem, 1.10rem + 1.80vw, 3rem)',     { lineHeight: '1.2' }],
        '6xl':  ['clamp(1.65rem, 1.20rem + 2.30vw, 3.75rem)',  { lineHeight: '1.15' }],
        '7xl':  ['clamp(1.85rem, 1.30rem + 2.80vw, 4.5rem)',   { lineHeight: '1.1' }],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
