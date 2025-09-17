import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
           return  false
            // // 如果是 el- 开头的标签，不视为自定义元素（让 Vue 处理）
            // if (tag.startsWith('el-')) {
            //   return false;
            // }
            // // 其他包含 - 的标签视为自定义元素（比如 web components）
            // return tag.includes('-');
          }
        }
      }
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  base: './',
  root: resolve(__dirname, './src/renderer'),
  publicDir: resolve(__dirname, './public'),
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/renderer/index.html')
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/smart': {
        target: 'http://192.168.1.180:48099',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' data:; connect-src 'self' ws: wss: http: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  }
});
