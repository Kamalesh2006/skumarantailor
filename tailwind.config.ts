import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // S Kumaran Atelier Palette
        charcoal: {
          50: "#f7f7f7",
          100: "#e3e3e3",
          200: "#c8c8c8",
          300: "#a4a4a4",
          400: "#818181",
          500: "#666666",
          600: "#515151",
          700: "#434343",
          800: "#383838",
          900: "#2D2D2D",
          950: "#1a1a1a",
        },
        brown: {
          50: "#fdf8f0",
          100: "#f5e6d0",
          200: "#e8c99e",
          300: "#d4a76e",
          400: "#c08a48",
          500: "#8B5A2B",
          600: "#6f4722",
          700: "#56371a",
          800: "#3e2813",
          900: "#2a1b0d",
          950: "#1a1008",
        },
        gold: {
          50: "#fefbe8",
          100: "#fdf5c4",
          200: "#fce98c",
          300: "#f5d44a",
          400: "#D4AF37",
          500: "#b8932a",
          600: "#9a7520",
          700: "#7a591b",
          800: "#5e4418",
          900: "#4a3615",
          950: "#2e200b",
        },
        cream: {
          50: "#FFFFFF",
          100: "#FDFCFB",
          200: "#FAF7F4",
          300: "#F5F2F0",
          400: "#E8E4E0",
          500: "#D4CFC9",
          600: "#B0AAA2",
          700: "#8C867E",
          800: "#68635C",
          900: "#44403A",
          950: "#2A2724",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "pulse-slow": "pulse 3s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
