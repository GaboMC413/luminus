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
          bg: '#F8FAFC',
          text: '#111827',
          secondary: '#4B5563',
          blue: {
            DEFAULT: '#2563EB',
            soft: '#EFF6FF',
          },
          mint: {
            soft: '#DFF7EF',
            text: '#0D9488', // professional dark teal for legible text on mint background
          },
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 40px rgba(37, 99, 235, 0.06)',
        'accent': '0 4px 20px rgba(37, 99, 235, 0.15)',
        'accent-hover': '0 6px 24px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
