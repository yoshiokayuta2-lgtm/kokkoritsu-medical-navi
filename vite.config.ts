import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  // GitHubのブラウザアップロードで残った旧publicフォルダを公開物へ混ぜない。
  publicDir: "site-assets",
  plugins: [react()],
});
