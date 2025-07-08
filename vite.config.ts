import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

const isDocker = process.env.IS_DOCKER === 'true' // bạn set IS_DOCKER=true trong Docker ENV

export default defineConfig({
  plugins: [
    adonisjs({
      entrypoints: ['resources/css/app.css', 'resources/js/app.js'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  cacheDir: isDocker ? '/tmp/vite_cache' : 'node_modules/.vite',

  server: {
    host: '0.0.0.0',
    port: 3333,
    allowedHosts: ['nvcd.xyz'],
    watch: {
      usePolling: isDocker, // chỉ enable polling trong Docker
      interval: 1000,
    },
  },

  optimizeDeps: {
    force: false, // không ép unless cần
  },
})
