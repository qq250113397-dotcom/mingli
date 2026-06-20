import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    license: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "iztro",
              test: /node_modules[\\/]iztro/,
              priority: 30,
              maxSize: 450_000,
            },
            {
              name: "classics",
              test: /content[\\/]classics/,
              priority: 25,
              maxSize: 400_000,
            },
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler)/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 10,
              maxSize: 450_000,
            },
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  plugins: [react()],
});
