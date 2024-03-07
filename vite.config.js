import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/riot': {
        target: 'https://europe.api.riotgames.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/riot/, '')
      }
    }
  }
})
