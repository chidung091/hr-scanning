import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      /**
       * Entrypoints of your application. Each entrypoint will
       * result in a separate bundle.
       */
      entrypoints: ['resources/css/app.css', 'resources/js/app.js'],

      /**
       * Paths to watch and reload the browser on file change
       */
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  // Configure cache directory and permissions
  cacheDir: '/tmp/.vite',

  // Server configuration for Docker
  server: {
    host: '0.0.0.0',
    port: 3333,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    force: true,
  },
})
