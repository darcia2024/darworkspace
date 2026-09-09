/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#fafafa',
        bento: {
          apricot: '#fdecd2',
          apricotDeep: '#fed7aa',
          apricotLight: '#fff6ea',
          pink: '#fce7f3',
          pinkDeep: '#fbcfe8',
          pinkLight: '#fdf2f8',
          pinkBar: '#ec4899',
          blue: '#e0f2fe',
          blueDeep: '#bae6fd',
          blueLight: '#f0f9ff',
          lime: '#ecfccb',
          limeDeep: '#d9f99d',
          limeLight: '#f7fee7',
          lavender: '#f3e8ff',
          lavenderDeep: '#e9d5ff',
          lavenderLight: '#faf5ff',
          yellow: '#fef08a',
          black: '#111111',
          charcoal: '#18181b',
          surface: '#ffffff',
          border: '#e4e4e7',
          borderSubtle: '#f4f4f5'
        },
        cream: {
          canvas: '#fafafa',
          card: '#ffffff',
          sidebar: '#ffffff',
          strong: '#f4f4f5',
          border: '#e4e4e7',
          borderHover: '#d4d4d8',
        },
        charcoal: {
          DEFAULT: '#111111',
          dark: '#09090b',
          muted: '#71717a',
          dim: '#a1a1aa',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      width: {
        '18': '4.5rem',
      },
      scale: {
        '98': '0.98',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'bento': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'bento-hover': '0 12px 28px -4px rgba(0, 0, 0, 0.08)',
        'sticker': '0 2px 8px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
