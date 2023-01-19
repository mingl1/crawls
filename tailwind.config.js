/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        egg: "#DAD7CD",
        sprout: "#A3B18A",
        pea: "#588157",
        forest: "#3A5A40",
        moss: "#2B3D26",
      },
    },
  },
  plugins: [],
};
