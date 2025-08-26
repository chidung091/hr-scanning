/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './resources/views/**/*.edge',
    './resources/js/**/*.{ts,tsx}',
    './resources/css/**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E93AB',
          50: '#eefcfd',
          100: '#d4f6f9',
          200: '#afedf2',
          300: '#78dee8',
          400: '#3ac6d6',
          500: '#1ea9bc',
          600: '#1e93ab',
          700: '#1d6d81',
          800: '#205a6a',
          900: '#1f4b5a',
          950: '#0f313d',
        },
        danger: {
          DEFAULT: '#E62727',
          50: '#fff1f1',
          100: '#ffe1e1',
          600: '#e62727',
          700: '#c11414',
          900: '#841818',
        },
        surface: {
          DEFAULT: '#F3F2EC',
        },
        neutral: {
          DEFAULT: '#DCDCDC',
        },
      },
    },
  },
  plugins: [],
}

