/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FBEDE1',
        surface: 'var(--surface-bg, #FFFFFF)',
        soft: 'var(--soft-bg, #FFF4E8)',
        muted: '#FBEEE0',
        ink: '#241C15',
        subtle: '#7A6F63',
        line: '#F0E1D1',
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb, 255 90 54) / <alpha-value>)',
          soft: '#FFE8DE',
          deep: 'rgb(var(--accent-deep-rgb, 217 63 30) / <alpha-value>)',
        },
        ember: 'rgb(var(--micro-accent-rgb, 255 176 32) / <alpha-value>)',
        teal: {
          DEFAULT: 'rgb(var(--teal-accent-rgb, 255 201 77) / <alpha-value>)',
          soft: '#FFF6DE',
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
        glow: '0 8px 30px -8px rgba(255,90,54,0.35)',
        'glow-lg': '0 24px 60px -16px rgba(255,90,54,0.32)',
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
        'blob-float': {
          '0%, 100%': { transform: 'scale(1) translateY(0)' },
          '50%': { transform: 'scale(1.08) translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
        'blob-float': 'blob-float 9s ease-in-out infinite',
        shimmer: 'shimmer 3.2s linear infinite',
      },
    },
  },
  plugins: [],
}
