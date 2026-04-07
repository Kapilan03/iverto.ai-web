/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          50: "#e8eef5",
          100: "#c5d3e8",
          200: "#9fb5d9",
          300: "#7896c9",
          400: "#5a7ebd",
          500: "#3c66b0",
          600: "#3459a0",
          700: "#2a498b",
          800: "#1e3a5f",
          900: "#0f2440",
          950: "#081526",
        },
      },
    },
  },
  plugins: [],
};
