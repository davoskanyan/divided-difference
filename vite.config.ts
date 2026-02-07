import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import macros from 'unplugin-parcel-macros'
import optimizeLocales from '@react-aria/optimize-locales-plugin'

export default defineConfig({
  base: '/divided-difference/',
  plugins: [
    macros.vite(),
    react(),
    tailwindcss(),
    {
      ...optimizeLocales.vite({ locales: ['en-US'] }),
      enforce: 'pre',
    },
  ],
  build: {
    target: ['es2022'],
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/macro-(.*)\.css$/.test(id) || /@react-spectrum\/s2\/.*\.css$/.test(id)) {
            return 's2-styles'
          }
        },
      },
    },
  },
})
