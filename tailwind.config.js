/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pomodoroテーマカラー（PWAマニフェストと統一）
        primary: '#e11d48', // rose-600
        background: '#111111',
      },
    },
  },
  plugins: [],
};
