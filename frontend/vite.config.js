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
                target: 'https://battery-traceability.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/serialization/, '')
            },
            '/api/barcode': {
                target: 'https://barcode-4o85.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/barcode/, '')
            },
            '/api/inspection': {
                target: 'https://inspection-zj0k.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/inspection/, '')
            },
            '/api/aggregation': {
                target: 'https://aggregation01.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/aggregation/, '')
            },
            '/api/epcis': {
                target: 'https://epics-l152.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/epcis/, '')
            }
        }
    }
})