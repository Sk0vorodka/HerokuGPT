import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#212121",
        panel: "#171717",
        soft: "#2f2f2f",
        border: "#3a3a3a",
        text: "#ececec",
        muted: "#a1a1aa",
        accent: "#10a37f"
      }
    }
  },
  plugins: []
};

export default config;