/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Blue (matches main CareBridge Connect)
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1B4798',
          700: '#164080',
          800: '#123368',
          900: '#0d2750',
        },
        // Accent Cyan
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#1BA3C6',
          600: '#1790b0',
          700: '#137899',
          800: '#0f6082',
          900: '#0c4e6b',
        },
        // Navy (text/borders)
        navy: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Mint (success)
        mint: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        },
        // Keep brand alias for backward compat during migration
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1B4798',
          700: '#164080',
          800: '#123368',
          900: '#0d2750',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.06)',
        'glass-lg': '0 16px 48px 0 rgba(15, 23, 42, 0.08)',
        'float': '0 20px 40px -12px rgba(27, 71, 152, 0.2)',
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px 0 rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
