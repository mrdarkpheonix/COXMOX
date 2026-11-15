import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, "DATA"),
  base: "./",
  server: {
    host: "127.0.0.1",
  },
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
  },
});
