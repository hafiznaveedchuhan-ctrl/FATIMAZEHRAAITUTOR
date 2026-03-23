import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0A0A0B',
          900: '#111113',
          800: '#1A1A1F',
          700: '#1F1F23',
          600: '#2A2A2F',
        },
        gray: {
          600: '#4B5563',
          400: '#9CA3AF',
          100: '#F5F5F7',
        },
        indigo: {
          600: '#4F46E5',
          500: '#6C63FF',
          400: '#818CF8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config

export default config
