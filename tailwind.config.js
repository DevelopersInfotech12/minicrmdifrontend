/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
    fontFamily: {
  zoho: ['"DM Sans"', 'sans-serif'],
  display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'monospace'],
  poppins: ['Poppins', 'system-ui', 'sans-serif'],
},
      colors: {
        gold: {
          50: '#fdf9ee',
          100: '#faf0d0',
          200: '#f5e0a0',
          300: '#edc95f',
          400: '#e8b84b',
          500: '#d4a843',
          600: '#c4922a',
          700: '#9a7020',
          800: '#7a5818',
          900: '#5a4010',
        },
        surface: {
          light: '#f3f4f6',
          dark: '#161410',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 0.3s ease both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-up': 'slideUp 0.4s ease-out both',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn: { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      borderRadius: {
        'xl2': '20px',
        'xl3': '28px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.4)',
        'gold': '0 2px 8px rgba(196,146,42,0.25)',
        'gold-lg': '0 4px 16px rgba(196,146,42,0.3)',
      },
    },
  },
  plugins: [],
}
