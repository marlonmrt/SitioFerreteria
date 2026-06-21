import { defineConfig } from "vitest/config";
import path from "path";

// Load environment variables for vitest
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(path.resolve(__dirname, ".env"));
  } catch {
    // Ignore if file doesn't exist
  }
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  }
});

