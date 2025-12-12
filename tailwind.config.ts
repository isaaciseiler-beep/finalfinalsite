import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        fg: "#ffffff",
        mutefg: "#a1a1a1",
        border: "#1a1a1a",
      },
      fontFamily: {
        sans: ['Switzer', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.6)",
      },
      letterSpacing: {
        tightish: "-0.01em",
      },
    },
  },
  plugins: [],
};
export default config;
