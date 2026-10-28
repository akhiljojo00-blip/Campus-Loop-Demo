/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F2F7F4',
          100: '#E1EDE5',
          200: '#C2DBCB',
          600: '#2A5540',
          700: '#1F4231',
          800: '#193A2B',
          900: '#153225',
          950: '#0B1C14',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FAECE6',
          200: '#F4D6CA',
          500: '#D4633B',
          600: '#BA4E29',
          700: '#9B3F1F',
          800: '#7E341B',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EDE5DC',
          400: '#DDD2C4',
        },
        sage: {
          50: '#F5F8F6',
          100: '#E8EFEA',
          200: '#D2E1D7',
          300: '#B0C9B9',
          600: '#4A6B56',
          700: '#3D5947',
        },
        charcoal: {
          700: '#424242',
          800: '#2B2B2B',
          900: '#1C2520',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(21, 50, 37, 0.05), 0 2px 6px -1px rgba(21, 50, 37, 0.03)',
        'warm-md': '0 8px 30px -4px rgba(21, 50, 37, 0.08), 0 4px 10px -2px rgba(21, 50, 37, 0.04)',
        'warm-lg': '0 20px 40px -6px rgba(21, 50, 37, 0.12), 0 8px 16px -4px rgba(21, 50, 37, 0.06)',
      }
    },
  },
  plugins: [],
}
