import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'https://sms-nest.onrender.com';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'Services': '/src/Services',
      },
    },

    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false
        },
        '/auth': {
          target,
          changeOrigin: true,
          secure: false
        },
        '/uploads': {
          target,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})

