/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0A0E14',
        'surface-secondary': '#0F1620',
        'surface-card': 'rgba(255, 255, 255, 0.06)',
        low: 'var(--low, #10B981)',
        moderate: 'var(--moderate, #F59E0B)',
        high: 'var(--high, #EF4444)',
        ai: 'var(--ai-accent, #22D3EE)',
        'ai-accent': 'var(--ai-accent, #22D3EE)',
        brand: {
          emerald: '#10B981',
          teal: '#22D3EE',
          blue: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
      },
      fontSize: {
        hero: ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        h1: ['40px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        h2: ['28px', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '-0.01em' }],
        body: ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        small: ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        card: '20px',
      },
      backdropBlur: {
        glass: '20px',
        'glass-strong': '30px',
      },
      animation: {
        'mesh-slow': 'gradientMesh 15s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        gradientMesh: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -25px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
