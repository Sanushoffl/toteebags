/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dominant': '#012622',
        'secondary': '#328E6E',
        'accent': '#FF8966',
      }
    },
  },
  plugins: [],
}