/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#E9EDF2',
        surface: 'var(--surface-bg, #FFFFFF)',
        soft: 'var(--soft-bg, #F8FAFC)',
        muted: '#F1F5F9',
        ink: '#111827',
        subtle: '#667085',
        line: '#E8EBEF',
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb, 65 105 225) / <alpha-value>)',
          soft: '#EEF2FF',
          deep: 'rgb(var(--accent-deep-rgb, 39 70 184) / <alpha-value>)',
        },
        ember: 'rgb(var(--micro-accent-rgb, 255 113 91) / <alpha-value>)',
        teal: {
          DEFAULT: 'rgb(var(--teal-accent-rgb, 20 184 166) / <alpha-value>)',
          soft: '#ECFDF9',
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: { shell: '1360px' },
      borderRadius: { shell: '28px' },
      boxShadow: {
        shell: '0 1px 2px rgba(16,24,40,0.04), 0 24px 64px -32px rgba(16,24,40,0.18)',
        lift: '0 12px 32px -16px rgba(16,24,40,0.24)',
        glow: '0 8px 30px -8px rgba(65,105,225,0.35)',
        'glow-lg': '0 24px 60px -16px rgba(65,105,225,0.32)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        grain: 'radial-gradient(circle at 1px 1px, rgba(17,24,39,0.06) 1px, transparent 0)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
}
