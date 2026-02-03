/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kitchen: {
          red: '#E63946',
          cream: '#F1FAEE',
          teal: '#A8DADC',
          blue: '#457B9D',
          navy: '#1D3557',
          orange: '#F77F00',
          green: '#06D6A0',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
