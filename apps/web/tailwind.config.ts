import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        teal: '#0F766E',
        signal: '#2563EB',
        mist: '#F8FAFC',
        line: '#CBD5E1',
      },
      borderRadius: {
        ui: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
