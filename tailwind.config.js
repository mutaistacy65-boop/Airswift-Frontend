/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        accent: '#f97316',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#8b5cf6',
        teal: '#14b8a6',
      },
      backgroundColor: {
        light: '#f8f9fa',
        dark: '#1f2937',
        card: '#ffffff',
      },
      borderRadius: {
        'lg': '0.875rem',
        'xl': '1rem',
      },
      shadows: {
        'soft': '0 1px 3px rgba(0,0,0,0.1)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}