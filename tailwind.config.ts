import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1f2937",
          soft: "#4b5563",
          faint: "#9ca3af",
        },
        brand: {
          DEFAULT: "#2563eb",
          soft: "#e8eefc",
          deep: "#1d4ed8",
        },
        // 중요도 색상 (난이도)
        easy: "#22c55e",   // 쉬움
        normal: "#f59e0b", // 보통
        hard: "#ef4444",   // 어려움
        line: "#e5e7eb",
        canvas: "#f6f7f9",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        pop: "0 10px 30px rgba(16, 24, 40, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
