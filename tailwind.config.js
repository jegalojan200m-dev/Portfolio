/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00f3ff',
          purple: '#bc13fe',
          magenta: '#ff00ff',
          cyan: '#00f3ff',
          dark: '#0a0a0f',
          darker: '#050508',
          card: 'rgba(20, 20, 30, 0.6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 5px #00f3ff, 0 0 20px #00f3ff40' },
          '50%': { boxShadow: '0 0 10px #00f3ff, 0 0 40px #00f3ff60' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff40' },
          '100%': { textShadow: '0 0 20px #bc13fe, 0 0 40px #bc13fe60' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
