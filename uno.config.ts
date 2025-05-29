import { defineConfig } from 'unocss'
import presetWind from '@unocss/preset-wind'

export default defineConfig({
  presets: [
    presetWind(), // Tailwind CSS 互換プリセット
  ],
  content: {
    filesystem: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
  },
}) 