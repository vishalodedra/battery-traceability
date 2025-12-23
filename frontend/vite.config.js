import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        host: true,
        proxy: {
            '/api/serialization': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/serialization/, '')
            },
            '/api/barcode': {
                target: 'http://localhost:3002',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/barcode/, '')
            },
            '/api/inspection': {
                target: 'http://localhost:3003',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/inspection/, '')
            },
            '/api/aggregation': {
                target: 'http://localhost:3004',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/aggregation/, '')
            },
            '/api/epcis': {
                target: 'http://localhost:3008',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/epcis/, '')
            }
        }
    }
})