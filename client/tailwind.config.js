/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rausch: {
          DEFAULT: '#FF385C',
          dark: '#E61E4D',
          light: '#FF5A5F'
        },
        babu: '#008489',
        slateCharcoal: '#222222',
        alabaster: '#FAFAFA',
        subtleBorder: '#EBEBEB',
        lightGray: '#717171'
      },
      fontFamily: {
        sans: ['Circular', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'airbnb': '0 6px 16px rgba(0,0,0,0.12)',
        'airbnb-hover': '0 12px 24px rgba(0,0,0,0.18)',
        'modal': '0 8px 28px rgba(0, 0, 0, 0.28)',
      }
    },
  },
  plugins: [],
}
