/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: '#FBF8F3',
          DEFAULT: '#F5EFE7',
          dark: '#EBE3D5',
        },
        ink: {
          dark: '#2B1810',
          medium: '#5C4033',
          light: '#8B7355',
        },
        accent: {
          burgundy: '#7A2828',
          forest: '#2D5016',
          amber: '#D4A574',
          gold: '#C9A961',
        },
      },
      fontFamily: {
        heading: ['Crimson Text', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        accent: ['Cinzel Decorative', 'serif'],
        mono: ['Courier New', 'monospace'],
      },
      fontSize: {
        xs: ['13px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.6' }],
        base: ['16px', { lineHeight: '1.75' }],
        lg: ['18px', { lineHeight: '1.75' }],
        xl: ['22px', { lineHeight: '1.4' }],
        '2xl': ['28px', { lineHeight: '1.3' }],
        '3xl': ['36px', { lineHeight: '1.2' }],
      },
      borderRadius: {
        'ornate': '12px',
      },
      boxShadow: {
        'parchment': '0 2px 8px rgba(43, 24, 16, 0.08)',
        'raised': '0 4px 12px rgba(43, 24, 16, 0.12)',
        'inset-soft': 'inset 0 2px 4px rgba(43, 24, 16, 0.06)',
      },
      backgroundImage: {
        'parchment-texture': "url('/textures/parchment-noise.png')",
        'leather': "url('/textures/leather.png')",
      },
      animation: {
        'token-move': 'tokenMove 0.3s ease-out',
        'hp-change': 'hpChange 0.4s ease-out',
        'dice-roll': 'diceRoll 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        tokenMove: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        hpChange: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        diceRoll: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
