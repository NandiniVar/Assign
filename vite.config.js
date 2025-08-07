import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".", // 👈 make sure this is present
  publicDir: "public", // 👈 optional but safe
  build: {
    outDir: "dist",
  },
});
