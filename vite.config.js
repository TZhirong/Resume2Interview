import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 关键：使用相对路径打包，适配 Gitee Pages 等部署在子路径（如 /用户名/仓库名/）的场景
  base: './',
  build: {
    // pdfjs-dist 的 worker 体积较大，提示浏览器可缓存拆分后的 chunk
    chunkSizeWarningLimit: 1500,
  },
})
