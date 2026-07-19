/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#005454",
        "primary-container": "#006e6e",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#002020",
        "secondary-container": "#9cf1f1",
        "on-secondary-container": "#007070",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "background": "#f8f9fa",
        "surface": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "surface-container": "#ededee",
        "surface-container-low": "#f3f4f5",
        "surface-container-high": "#e3e4e5",
        "surface-container-highest": "#e1e3e4",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191c1d",
        "on-surface-variant": "#3e4948",
        "outline": "#6e7979",
        "outline-variant": "#bec9c8",
        // ... (Agrega el resto de tus colores aquí)
      },
      fontFamily: {
        "headline-lg": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
      },
      spacing: {
        "base": "8px",
        "section-gap": "48px",
        "gutter": "16px",
        "container-margin": "24px"
      }
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/container-queries')
  ],
}