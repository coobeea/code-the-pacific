import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 单页静态站：base 保持 '/'（部署到任意静态托管根路径，无仓库名前缀）
export default defineConfig({
  base: '/',
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 500,
  },
})
