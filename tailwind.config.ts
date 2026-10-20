import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] },
      colors: { ink: "#111111", paper: "#f6f5f1", acid: "#d7ff64" },
    },
  },
  plugins: [],
} satisfies Config;
