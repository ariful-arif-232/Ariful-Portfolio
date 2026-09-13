/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#E9EDF2',
        surface: '#FFFFFF',
        soft: '#F8FAFC',
        muted: '#F1F5F9',
        ink: '#171717',
        subtle: '#667085',
        line: '#E8EBEF',
        accent: {
          DEFAULT: '#2563EB',
          soft: '#EFF4FF',
          deep: '#1D4ED8',
        },
        ember: '#FF6B4A',
        teal: '#0F766E',
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
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
