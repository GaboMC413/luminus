/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luminus: {
          cobalt: '#0450FB',
          tangerine: '#FF7700',
          'tangerine-light': '#eed7c4',
          violet: '#6D28D9',
          'violet-light': '#d5c9e8',
          chartreuse: '#A8C800',
          'chartreuse-light': '#e7eec4',
          magenta: '#E855C8',
          'magenta-light': '#e9c9e2',
          amber: '#F0A500',
          crimson: '#E63946',
          emerald: '#0FA87A',
        }
      },
      fontSize: {
        'heading-1': ['60px', { lineHeight: '72px' }],
        'heading-2': ['56px', { lineHeight: '68px' }],
        'heading-3': ['40px', { lineHeight: '48px' }],
        'heading-4': ['42px', { lineHeight: '52px' }],
        'heading-5': ['28px', { lineHeight: '40px' }],
        'heading-6': ['24px', { lineHeight: '30px' }],
        'body-large': ['18px', { lineHeight: '26px' }],
        'body-medium': ['16px', { lineHeight: '24px' }],
        'body-small': ['14px', { lineHeight: '22px' }],
        'body-xs': ['12px', { lineHeight: '20px' }],
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      rotate: {
        '15': '15deg',
        '-15': '-15deg',
      }
    },
  },
  plugins: [],
}
