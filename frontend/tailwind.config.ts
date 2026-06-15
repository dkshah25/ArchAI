import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#030303",
        foreground: "#ededed",
        card: {
          DEFAULT: "rgba(10, 10, 10, 0.7)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        primary: {
          DEFAULT: "#3b82f6",
          dark: "#1d4ed8",
        },
        neon: {
          cyan: "#06b6d4",
          purple: "#a855f7",
          green: "#10b981",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "border-glow 4s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
      },
      keyframes: {
        "border-glow": {
          "0%, 100%": { "border-color": "rgba(6, 182, 212, 0.3)" },
          "50%": { "border-color": "rgba(168, 85, 247, 0.8)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
