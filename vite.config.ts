import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Read API key from amplify_outputs.json
const amplifyOutputs = JSON.parse(fs.readFileSync('./amplify_outputs.json', 'utf-8'))
const apiKey = amplifyOutputs.data.api_key

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphql': {
        target: 'https://stkmppltbvghtmlvefafkz4ste.appsync-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res, _options) => {
            // Add the API key to the request headers
            proxyReq.setHeader('x-api-key', apiKey)
          })
        }
      }
    }
  }
})
