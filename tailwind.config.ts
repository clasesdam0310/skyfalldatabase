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
        skyfall: {
          primary: '#4e4aa7',   // Púrpura azulado profundo (acento frío)
          secondary: '#cb78bb',  // Rosa/púrpura vibrante (acento cálido)
          950: '#0B0F15',
          900: '#121720',
          800: '#1A212C',
        },
      },
      backgroundImage: {
        'gradient-bitonal': 'linear-gradient(135deg, #4e4aa7 0%, #cb78bb 100%)',
        'gradient-bitonal-subtle': 'linear-gradient(135deg, rgba(78,74,167,0.1) 0%, rgba(203,120,187,0.05) 100%)',
      },
      boxShadow: {
        'bitonal': '0 8px 30px rgba(78,74,167,0.2)',
        'bitonal-hover': '0 20px 40px rgba(203,120,187,0.25)',
        'bitonal-glow': '0 0 20px rgba(78,74,167,0.3), 0 0 40px rgba(203,120,187,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-bitonal': 'glow-bitonal 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'glow-bitonal': {
          '0%': { boxShadow: '0 0 20px rgba(78,74,167,0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(203,120,187,0.4)' },
        },
      },
    },
  },
  plugins: [],
}

export default config