import type { Config } from 'tailwindcss'

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
        "primary-fixed": "#9cf1f0",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#002020",
        "secondary-container": "#9cf1f1",
        "on-secondary-container": "#007070",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "background": "#f8f9fa",
        "surface": "#f8f9fa",
        "surface-bright": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "surface-container": "#ededee",
        "surface-container-low": "#f3f4f5",
        "surface-container-high": "#e3e4e5",
        "surface-container-highest": "#e1e3e4",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#191c1d",
        "on-surface-variant": "#3e4948",
        "inverse-surface": "#2e3132",
        "inverse-on-surface": "#f0f1f2",
        "outline": "#6e7979",
        "outline-variant": "#bec9c8",
      },
      fontFamily: {
        "headline-lg": ["Hanken Grotesk", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "title-md": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      spacing: {
        "base": "8px",
        "section-gap": "48px",
        "gutter": "16px",
        "container-margin": "24px"
      }
    },
  },
  plugins: [],
} satisfies Config
