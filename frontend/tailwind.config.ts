import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07100d",
        panel: "#0d1814",
        panel2: "#12231d",
        line: "#1d3a30",
        mint: "#39ffad",
        gold: "#e8c46a",
        redsignal: "#ff5c7a"
      },
      boxShadow: {
        glow: "0 0 40px rgba(57, 255, 173, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
