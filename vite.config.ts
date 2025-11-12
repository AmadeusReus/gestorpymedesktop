import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['pg', 'pg-native', 'bcryptjs']
            }
          },
          define: {
            'process.env.DB_HOST': JSON.stringify(process.env.DB_HOST),
            'process.env.DB_USER': JSON.stringify(process.env.DB_USER),
            'process.env.DB_PASSWORD': JSON.stringify(process.env.DB_PASSWORD),
            'process.env.DB_NAME': JSON.stringify(process.env.DB_NAME),
            'process.env.DB_PORT': JSON.stringify(process.env.DB_PORT)
          }
        }
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'es',
                entryFileNames: 'preload.mjs',
                inlineDynamicImports: false
              }
            }
          }
        }
      }
    }),
  ],
  build: {
    outDir: 'dist'
  }
})