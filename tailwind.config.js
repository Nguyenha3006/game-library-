/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Tech Blue primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        edtech: {
          surface: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0',
          muted: '#64748b',
          accent: '#0284c7', // Sky learning accent
        }
      },
      borderRadius: {
        'lg': '0.625rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.04), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'card-hover': '0 12px 24px -4px rgb(37 99 235 / 0.12), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
