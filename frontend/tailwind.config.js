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
        "primary": "#f59e0b",
        "primary-fixed": "#fbbf24",
        "surface": "#ffffff",
        "surface-container-low": "#f5f5f5",
        "on-background": "#1a1a1a",
        "on-surface": "#18181b",
        "on-surface-variant": "#52525b",
        "outline-variant": "#e5e5e5",
        "secondary": "#71717a",
        "background": "#fdfdfd",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#fafafa",
        "surface-container-highest": "#e5e5e5",
        "surface-container": "#f9f9f9",
        "surface-dim": "#f0f0f0",
        "surface-bright": "#ffffff",
        "error": "#ef4444"
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.5rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
