import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        poker: resolve(__dirname, "src/scenes/games/poker/game.html"),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 8000,
    open: true,
  },
});
