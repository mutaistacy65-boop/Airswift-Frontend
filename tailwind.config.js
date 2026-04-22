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
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#0A66C2',
        'primary-dark': '#004182',
        'primary-light': '#E8F0FE',
        accent: '#22C55E',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        border: '#E5E7EB',
        // Keep some existing colors for compatibility
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