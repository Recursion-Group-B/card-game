import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tsconfigPaths()],
    server: {
        port: 3000,
        open: true,
    },
    preview: {
        port: 8000,
        open: true,
    },
})