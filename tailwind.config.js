/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        'slate-750': '#243244',
      },
      animation: {
        'bounce-slow': 'bounceSlow 1.6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        terminal: '0 24px 80px rgba(15, 23, 42, 0.45)',
      },
      backgroundImage: {
        'grid-dots': 'radial-gradient(circle, rgba(51, 65, 85, 0.75) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};