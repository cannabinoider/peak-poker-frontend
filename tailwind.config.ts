import type { Config } from "tailwindcss";

/**
 * Design tokens ported from the Flutter app (`ui/design.dart`). Colors live
 * as CSS variables in `src/app/globals.css`; Tailwind reads them here so
 * opacity modifiers (`bg-gold/20`) work.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "bg-top": token("bg-top"),
        "bg-bottom": token("bg-bottom"),
        "felt-center": token("felt-center"),
        "felt-edge": token("felt-edge"),
        rim: token("rim"),
        gold: token("gold"),
        "gold-deep": token("gold-deep"),
        green: token("green"),
        red: token("red"),
        "all-in": token("all-in"),
        text: token("text"),
        seat: {
          0: token("seat-0"),
          1: token("seat-1"),
          2: token("seat-2"),
          3: token("seat-3"),
          4: token("seat-4"),
          5: token("seat-5"),
          6: token("seat-6"),
          7: token("seat-7"),
        },
      },
      textColor: {
        dim: "rgb(255 255 255 / 0.7)",
        faint: "rgb(255 255 255 / 0.4)",
      },
      backgroundColor: {
        glass: "rgb(255 255 255 / 0.08)",
      },
      borderColor: {
        glass: "rgb(255 255 255 / 0.12)",
      },
      borderRadius: {
        input: "14px",
        panel: "20px",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        app: "linear-gradient(to bottom, rgb(var(--bg-top)), rgb(var(--bg-bottom)))",
        felt: "radial-gradient(ellipse at center, rgb(var(--felt-center)), rgb(var(--felt-edge)))",
        "gold-button":
          "linear-gradient(to right, rgb(var(--gold)), rgb(var(--gold-deep)))",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "slide-up": "slide-up 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
