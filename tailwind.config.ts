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
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0c8ee6',
          600: '#0070c4',
          700: '#01599f',
          800: '#064b83',
          900: '#0b406d',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e5e3',
          200: '#c6ccc6',
          300: '#a2aca2',
          400: '#7d897d',
          500: '#626e62',
          600: '#4d574d',
          700: '#404740',
          800: '#363b36',
          900: '#2f332f',
        },
      },
    },
  },
  plugins: [],
}
export default config
