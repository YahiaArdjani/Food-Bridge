/**
 * Food Bridge — design tokens.
 *
 * Loaded into Tailwind CSS v4 through the `@config` directive at the top of
 * `app/globals.css` (v4 ships `jiti`, so a TypeScript config is supported).
 *
 * The palette is deliberately *not* Tailwind's stock green/amber:
 *  - `basil`  — warm, olive-leaning green (primary)
 *  - `ember`  — warm terracotta / harvest ochre (secondary accent)
 *  - `husk`   — warm paper-to-charcoal neutral ramp
 */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./middleware.ts",
  ],
  theme: {
    extend: {
      colors: {
        basil: {
          50: "#f4f8f1",
          100: "#e6efe0",
          200: "#cdddc2",
          300: "#a9c49a",
          400: "#82a771",
          500: "#648b53",
          600: "#4d7140",
          700: "#3d5a34",
          800: "#33482d",
          900: "#2b3c27",
          950: "#15200f",
        },
        ember: {
          50: "#fdf6ef",
          100: "#fbe9d7",
          200: "#f6d0ae",
          300: "#efb07c",
          400: "#e78a4b",
          500: "#e06f28",
          600: "#cb5718",
          700: "#a84216",
          800: "#883619",
          900: "#6f2f18",
          950: "#3d170a",
        },
        husk: {
          50: "#faf7f1",
          100: "#f3ede1",
          200: "#e6dcc9",
          300: "#d2c3a8",
          400: "#b8a382",
          500: "#9d8664",
          600: "#816c4f",
          700: "#665542",
          800: "#4e4234",
          900: "#332c23",
          950: "#1e1a14",
        },
        canvas: "#faf7f1",
        ink: "#1e1a14",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        display: [
          "var(--font-fraunces)",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        stamp: "1.5rem",
        tile: "2.25rem",
      },
      boxShadow: {
        "stamp-sm": "3px 3px 0 0 rgb(30 26 20 / 0.14)",
        stamp: "5px 5px 0 0 rgb(30 26 20 / 0.14)",
        "stamp-lg": "9px 9px 0 0 rgb(30 26 20 / 0.16)",
        lift: "0 24px 48px -30px rgb(30 26 20 / 0.55)",
      },
      letterSpacing: {
        label: "0.2em",
        headline: "-0.035em",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0) rotate(-2deg)" },
          "50%": { transform: "translateY(-10px) rotate(-1deg)" },
        },
        simmer: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        drift: "drift 7s ease-in-out infinite",
        simmer: "simmer 4s ease-in-out infinite",
      },
    },
  },
};

export default config;
