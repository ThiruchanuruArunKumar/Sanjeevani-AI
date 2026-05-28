/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E8A8A', // Medical Teal
          light: '#14A5A5',
          dark: '#0A6E6E',
          hover: '#0C7E7E',
          bg: '#EAF5F5',
        },
        secondary: {
          DEFAULT: '#10B981', // Emerald Green
          light: '#34D399',
          dark: '#059669',
        },
        accent: {
          DEFAULT: '#0F172A', // Deep Navy
          light: '#1E293B',
          dark: '#020617',
        },
        frosted: {
          DEFAULT: '#F8FAFC', // Frosted White background
          card: 'rgba(255, 255, 255, 0.75)',
          border: 'rgba(14, 138, 138, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(14, 138, 138, 0.1)',
        'premium-hover': '0 20px 40px -12px rgba(14, 138, 138, 0.2)',
        'glass': '0 8px 32px 0 rgba(14, 138, 138, 0.08)',
        'glow': '0 0 15px rgba(14, 138, 138, 0.25)',
      }
    },
  },
  plugins: [],
}
