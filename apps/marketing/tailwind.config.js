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
          blue: {
            DEFAULT: '#0450FB',
            soft: '#EFF6FF',
          },
          lime: {
            DEFAULT: '#D4E600',
            soft: '#F7FEE7',
          },
          orange: {
            DEFAULT: '#FF7700',
            soft: '#FFF7ED',
          },
          pink: {
            DEFAULT: '#FF80FC',
            soft: '#FDF2F8',
          },
          white: '#FFFFFF',
          black: '#000000',
          bg: '#FFFFFF',
          text: '#000000',
          secondary: '#4B5563',
          border: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 10px 40px rgba(0, 0, 0, 0.05)',
        'bold-sm': '2px 2px 0px 0px #000000',
        'bold': '4px 4px 0px 0px #000000',
        'bold-lg': '8px 8px 0px 0px #000000',
        'bold-blue': '4px 4px 0px 0px #0450FB',
        'bold-orange': '4px 4px 0px 0px #FF7700',
        'bold-lime': '4px 4px 0px 0px #D4E600',
        'bold-pink': '4px 4px 0px 0px #FF80FC',
      }
    },
  },
  plugins: [],
}
