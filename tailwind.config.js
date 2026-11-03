/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmos: {
          950: '#040209',
          900: '#090514',
          800: '#130c26',
          700: '#201440',
        },
        stardust: {
          gold: '#fcd34d',
          amber: '#fbbf24',
          violet: '#c084fc',
          cyan: '#38bdf8'
        }
      }
    },
  },
  plugins: [],
}
