import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // VIVERSE 會把打包內容部署在任意子路徑下，資源路徑一律使用相對路徑
  base: './',
  plugins: [react()],
})
