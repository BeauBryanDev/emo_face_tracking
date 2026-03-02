/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#0d0010',
          900: '#1a0030',
          800: '#2d0057',
          700: '#4a0080',
          600: '#6600b3',
          500: '#8800e6',
          400: '#aa00ff',
          300: '#cc44ff',
          200: '#dd88ff',
          100: '#f0ccff',
        },
        neon: {
          purple: '#bf00ff',
          violet: '#9d00ff',
          pink:   '#ff00cc',
        },
        surface: {
          0: '#0d0010',
          1: '#130020',
          2: '#1e0035',
          3: '#2a0048',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        mono:    ['Share Tech Mono', 'monospace'],
        body:    ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 8px rgba(170, 0, 255, 0.6)',
        'neon-md': '0 0 20px rgba(170, 0, 255, 0.5), 0 0 40px rgba(170, 0, 255, 0.2)',
        'neon-lg': '0 0 30px rgba(170, 0, 255, 0.7), 0 0 60px rgba(170, 0, 255, 0.3)',
      },
      animation: {
        'pulse-neon': 'statusPulse 2s ease-in-out infinite',
        'glitch':     'glitchFlicker 4s infinite',
        'scan':       'scanLine 2s linear infinite',
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(170,0,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(170,0,255,0.05) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'cyber-grid': '40px 40px',
      },
    },
  },
  plugins: [],
}