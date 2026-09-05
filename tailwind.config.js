import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif', ...defaultTheme.fontFamily.sans],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff8ff',
          100: '#dbedff',
          200: '#bedcff',
          300: '#91c6ff',
          400: '#5da6ff',
          500: '#3a86ff',
          600: '#2166ea',
          700: '#1a4fd0',
          800: '#1c43a6',
          900: '#1c3c83',
        },
        navy: {
          50: '#f3f6fb',
          100: '#e1e8f4',
          200: '#c2d0e8',
          300: '#93acd3',
          400: '#5d80b0',
          500: '#3a5f90',
          600: '#2a4a76',
          700: '#1d3a61',
          800: '#122c4c',
          900: '#0a1f39',
          950: '#061429',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))',
        'gradient-primary': 'linear-gradient(135deg, #2166ea, #1a4fd0)',
      },
    },
  },

  plugins: [forms, typography],
};
