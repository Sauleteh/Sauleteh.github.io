import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      {
        src: 'src/projects/*',
        dest: 'projects'
      }
    ]
  })],
  build: {
    outDir: "build",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(".", "index.html"),
        noPageFound: resolve(".", "404.html"),
        googleSearchConsole: resolve(".", "google107a1eae1939d59f.html"),
      },
    },
  },
})
