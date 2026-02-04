module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#7c3aed',
        dark: '#1e293b',
        light: '#f8fafc'
      },
      container: {
        center: true,
        padding: '1rem',
      }
    },
  },
  plugins: [],
}