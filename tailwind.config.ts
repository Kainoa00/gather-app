import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Soft Lavender - Primary
        lavender: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4deff',
          300: '#cdc2ff',
          400: '#b197fc',
          500: '#9775fa',
          600: '#845ef7',
          700: '#7950f2',
          800: '#6741d9',
          900: '#5f3dc4',
        },
        // Warm Peach - Accent
        peach: {
          50: '#fff8f6',
          100: '#ffefea',
          200: '#ffddd3',
          300: '#ffc4b0',
          400: '#ffa285',
          500: '#ff8a65',
          600: '#ff7043',
          700: '#f4511e',
          800: '#e64a19',
          900: '#bf360c',
        },
        // Soft Cream - Background
        cream: {
          50: '#fffffe',
          100: '#fefcfb',
          200: '#fdf8f5',
          300: '#faf3ee',
          400: '#f5ebe3',
          500: '#efe3d8',
          600: '#e0d0c1',
          700: '#c9b8a8',
          800: '#a69585',
          900: '#7d6e60',
        },
        // Deep Navy - Contrast
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        // Soft Mint - Success
        mint: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.1)',
        'float': '0 20px 40px -12px rgba(80, 70, 230, 0.25)',
        'float-peach': '0 20px 40px -12px rgba(255, 138, 101, 0.3)',
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(151, 117, 250, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255, 138, 101, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(151, 117, 250, 0.1) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(255, 138, 101, 0.08) 0px, transparent 50%)',
        'gradient-mesh-dark': 'radial-gradient(at 40% 20%, rgba(103, 65, 217, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255, 112, 67, 0.2) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
