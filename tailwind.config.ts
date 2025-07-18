import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced color palette inspired by artwork
        primary: {
          sage: '#B8C5B0',
          cream: '#F8F6F1',
          charcoal: '#2C2C2C',
          warm: '#F5F1E8', // Warmer cream for cards
        },
        accent: {
          coral: '#E85A4F',
          navy: '#1E3A8A',
          terracotta: '#C44536', // Deeper coral for highlights
          ochre: '#CC8A5B', // Warm earth tone
        },
        neutral: {
          gray: '#6B7280',
          'border-light': '#E5E7EB',
          'warm-gray': '#8B7355', // Warmer gray tone
        },
        admin: {
          sidebar: '#1F2937',
          background: '#F9FAFB',
          white: '#FFFFFF',
        },
        // Keep legacy colors for compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        // Professional typography
        'heading': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'elegant': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'elegant-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'admin-card': '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config