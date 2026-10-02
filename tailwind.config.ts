import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Upfleet brand system — primary is near-black, not blue.
        upfleet: {
          dark: "#0B0D10",
          body: "#1E1E1E",
          secondary: "#5B616A",
          tertiary: "#8A919A",
          "section-alt": "#F7F8FA",
          border: "#E5E7EB",
          "border-light": "#F0F1F3",
          blue: "#0D8FB8",
          yellow: "#FFC933",
          orange: "#FF6B35",
          steel: "#516175",
          positive: "#16A34A",
          negative: "#DC2626",
          warning: "#F59E0B",
        },
        // report-type accents (aligned to Upfleet's industrial pops)
        scam: "#DC2626",
        rent: "#16A34A",
        landlord: "#0D8FB8",
        clinic: "#F59E0B",
        other: "#5B616A",
      },
      fontFamily: {
        heading: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["var(--font-dmsans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        sans: ["var(--font-dmsans)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      letterSpacing: {
        brand: "-0.02em",
        "brand-tight": "-0.03em",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.08)",
        glass: "0 8px 32px rgba(0,0,0,0.06)",
        premium: "0 4px 16px rgba(11,13,16,0.2)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
