/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Primary
        'brand-red': '#8A1E1E',
        // Secondary Colors
        'charcoal': '#111111',
        'deep-gray': '#333333',
        'soft-silver': '#E6E6E6',
        'pure-white': '#FFFFFF',
        // Accent Colors
        'electric-blue': '#006CFF',
        'success-green': '#1DB954',
        'alert-orange': '#FF7A00',
      },
      fontFamily: {
        'heading': ['Poppins', 'Montserrat', 'sans-serif'],
        'body': ['Inter', 'Open Sans', 'sans-serif'],
        'ui': ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 108, 255, 0.4)',
        'glow-red': '0 0 20px rgba(138, 30, 30, 0.4)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lift': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 108, 255, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 108, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}

