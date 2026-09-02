import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          purple: "#a855f7",
          pink: "#ec4899",
          cyan: "#22d3ee",
          green: "#22c55e",
          red: "#ef4444",
        },
        zinc: {
          900: "#18181b",
          950: "#09090b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
