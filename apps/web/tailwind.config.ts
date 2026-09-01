import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        teal: '#0F766E',
        signal: '#2563EB',
        mist: '#F5F7FA',
        line: '#D7DEE8',
        gold: '#B7791F',
        navy: '#172033',
      },
      borderRadius: {
        ui: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
