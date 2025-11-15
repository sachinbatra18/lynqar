/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./script.js",
    "./*.js",
    "./*.html",
    "./*.css",
  ],
  safelist: [
    // Essential dark theme colors that might be purged
    'bg-black',
    'bg-gray-900',
    'bg-gray-800',
    'bg-gray-700',
    'text-white',
    'text-gray-400',
    'text-gray-300',
    'border-gray-700',
    'border-gray-600',
    'border-purple-500',
    'hover:bg-purple-500',
    'hover:border-purple-500',
    'backdrop-blur-lg',
    'backdrop-blur-md',
    'z-50',
    'z-[999]',
    '-translate-x-full',
    'translate-x-0',
    'text-4xl',
    'md:hidden',
    'md:flex',
    'hidden',
    'flex',
    'flex-col',
    'justify-between',
    'items-center',
    'space-x-3',
    'text-purple-300',
    'bg-purple-500',
    'bg-gradient-to-r',
    'from-white',
    'to-purple-400',
    'bg-clip-text',
    'text-transparent'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--accent)',
        accent: 'var(--accent)',
        accentStart: 'var(--accent-start)',
        accentEnd: 'var(--accent-end)',
        surface: 'var(--surface)',
        muted: 'var(--muted)',
        text: 'var(--text)',
        bg: 'var(--bg)',
        glass: 'rgba(255,255,255,0.03)',
        'glass-strong': 'rgba(255,255,255,0.06)',
        border: 'var(--border)',
        error: 'var(--error)',
        success: 'var(--success)',
        card: 'var(--card)',
        'text-muted': 'var(--text-muted)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)'
      },
      boxShadow: {
        'lynqar-lg': 'var(--shadow-lg)'
      },
      transitionDuration: {
        200: '200ms',
        320: '320ms'
      },
      screens: {
        md: '900px',
        lg: '1200px'
      }
    },
  },
  plugins: [],
}
