import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        // Luxe palette inspired by premium card metal finishes
        luxe: {
          bg: "#0F1216",
          surface: "#151A21",
          muted: "#1F2630",
          border: "#2A3340",
          slate: "#AEB6C2",
          gold: "#D4AF37",
          goldSoft: "#E3C45B",
          green: "#0E7A5F",
          red: "#D9534F",
        }
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,0.5)",
        ring: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(212,175,55,0.12)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    },
  },
  plugins: [],
} satisfies Config
