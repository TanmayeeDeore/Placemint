/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0effe',
          100: '#dddcfd',
          200: '#bbb8fb',
          500: '#534AB7',
          600: '#4339a0',
          700: '#332c7e',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    }
  },
  plugins: [],
}