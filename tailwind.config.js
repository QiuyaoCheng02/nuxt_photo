/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#2C8C92',   
          green: '#8CD6A3',  
          light: '#E6F7F8',  
          dark: '#1A5F63',   
          muted: '#64748B',  
        }
      }
    },
  },
  plugins: [],
}
