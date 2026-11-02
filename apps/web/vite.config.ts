import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves this repository as /tarot/, while local preview stays at /.
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true
  }
});
