import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // 개발 환경에서는 base를 '/'로 두어 새로고침 시 경고가 발생하지 않도록 하고,
  // 빌드 시에만 GitHub Pages 배포 경로를 사용
  base: command === 'build' ? '/member_list/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('프록시 오류:', err);
          });
        },
      }
    }
  }
}))
