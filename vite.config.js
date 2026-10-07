import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// base 必须写死仓库名，前后都带斜杠，否则 GitHub Pages 上资源 404 → 白屏（技术选型 · 坑 1）
export default defineConfig({
  base: '/',
  plugins: [vue(), tailwindcss()],
  build: {
    // 四入口按路由懒加载，首包更小（需求 N-01）
    chunkSizeWarningLimit: 500,
  },
})
