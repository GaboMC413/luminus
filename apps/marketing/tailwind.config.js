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
