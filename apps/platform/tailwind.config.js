/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wellness: {
          sand: {
            50: '#FAF9F6',
            100: '#F4EFE6',
            200: '#E8DEC9',
            300: '#DBCAAB',
            400: '#CBB28C',
          },
          sage: {
            50: '#F5F7F5',
            100: '#E8ECE7',
            200: '#CCD7CC',
            300: '#AFBFAF',
            400: '#91A791',
            500: '#6C856C', // Tranquil Sage Green primary
            600: '#546A54',
            700: '#3D4F3D',
            800: '#273327',
            900: '#131A13',
          },
          clay: {
            50: '#FDF7F5',
            100: '#FAECE6',
            200: '#F3D2C4',
            300: '#EBAFB7',
            400: '#E3917F',
            500: '#CB6A57', // Accent Terracotta
            600: '#A45040',
          },
          slate: {
            50: '#F8F9FA',
            500: '#64748B',
            800: '#1E293B',
            900: '#0F172A',
          }
        },
      },
      boxShadow: {
        'premium': '0 4px 24px -2px rgba(108, 133, 108, 0.06), 0 2px 8px -1px rgba(108, 133, 108, 0.04)',
        'premium-hover': '0 12px 36px -4px rgba(108, 133, 108, 0.10), 0 4px 16px -2px rgba(108, 133, 108, 0.06)',
      },
    },
  },
  plugins: [],
}
