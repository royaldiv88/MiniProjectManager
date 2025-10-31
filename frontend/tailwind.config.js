/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2B6CB0",
        accent: "#3B82F6",
        card: "#ffffff",
        bg: "#F3F6FB"
      },
      borderRadius: {
        xl: "1rem"
      }
    },
  },
  plugins: [],
}
