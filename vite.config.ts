import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Read API key from amplify_outputs.json
const amplifyOutputs = JSON.parse(fs.readFileSync('./amplify_outputs.json', 'utf-8'))
const apiKey = amplifyOutputs.data.api_key
const apiUrl = amplifyOutputs.data.url

// Extract the hostname from the URL
const apiHostname = new URL(apiUrl).origin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphql': {
        target: apiHostname,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res, _options) => {
            // Add the API key to the request headers
            proxyReq.setHeader('x-api-key', apiKey)
            
            // Log the request for debugging
            console.log(`Proxying request to ${req.method} ${req.url}`)
          })
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`Received response from ${req.method} ${req.url}: ${proxyRes.statusCode}`)
          })
          
          proxy.on('error', (err, req, _res) => {
            console.error(`Proxy error for ${req.method} ${req.url}:`, err)
          })
        }
      }
    }
  },
  build: {
    sourcemap: true
  }
})
