import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tw-animate-css")],
}

export default config