import inertia from '@adonisjs/inertia/vite'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/ssr.tsx' } }),
    react(),
    adonisjs({ entrypoints: ['inertia/app.tsx'], reload: ['resources/views/**/*.edge'] }),
  ],

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${import.meta.dirname}/inertia/`,
    },
  },
  server: {
    allowedHosts: ['.adonisjs.dev', 'localhost', '.ngrok-free.app', 'tunnel.bagusok.dev'],
    hmr: {
      port: 24679, // Unique port for web-admin HMR to avoid conflicts
    },
    watch: {
      // Prevent watch from crashing on Windows
      usePolling: false,
    },
  },
})
