import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./store/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lume: {
          bg: "#FAFAFA",
          primary: "#090909",
          secondary: "#737373",
          accent: "#F1F1F1",
          ink: "#0B0B0B",
          muted: "#737373",
          border: "#E7E7E4",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(0, 0, 0, 0.08)",
        soft: "0 14px 38px rgba(0, 0, 0, 0.055)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
