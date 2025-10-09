import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cinzel'", "serif"],
        body: ["'Inter'", "sans-serif"]
      },
      colors: {
        parchment: "#f2e8d5",
        ink: "#2f1b0c",
        accent: "#9b4a1b",
        "accent-dark": "#743314"
      },
      backgroundImage: {
        parchment: "radial-gradient(circle at top left, rgba(255,255,255,0.6), rgba(210,180,140,0.6))"
      }
    }
  },
  plugins: []
};

export default config;
