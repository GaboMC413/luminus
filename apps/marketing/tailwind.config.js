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
            pastel: '#DCE6FF',
            DEFAULT: '#0450FB',
            deep: '#002C9E',
          },
          lime: {
            pastel: '#F4F8B8',
            DEFAULT: '#D4E600',
            deep: '#7A8500',
          },
          orange: {
            pastel: '#FFE0C2',
            DEFAULT: '#FF7700',
            deep: '#B84A00',
          },
          pink: {
            pastel: '#FFE0FC',
            DEFAULT: '#FF80FC',
            deep: '#B832B4',
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
