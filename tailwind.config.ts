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
        accent: "#6366f1",
        "accent-dark": "#4338ca"
      }
    }
  },
  plugins: []
};

export default config;
