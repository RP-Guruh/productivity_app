import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { spawn } from 'child_process'

function leadScraperPlugin() {
  return {
    name: 'lead-scraper-plugin',
    configureServer(server) {
      server.middlewares.use('/api/leads/search', (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
        const keyword = url.searchParams.get('keyword') || ''
        const location = url.searchParams.get('location') || ''
        const limit = url.searchParams.get('limit') || '20'

        if (!keyword && !location) {
          res.setHeader('Content-Type', 'application/json')
          res.end('[]')
          return
        }

        const scriptPath = path.resolve(import.meta.dirname, '../google-maps-scraper/live-scraper.js')
        const proc = spawn('node', [scriptPath, keyword, location, limit])

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', data => { stdout += data.toString() })
        proc.stderr.on('data', data => { stderr += data.toString() })

        proc.on('close', code => {
          res.setHeader('Content-Type', 'application/json')
          if (code === 0 && stdout) {
            res.end(stdout)
          } else {
            console.error('Live scraper error:', stderr)
            res.end('[]')
          }
        })
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), leadScraperPlugin()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
})
