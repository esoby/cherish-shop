import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import compression from "vite-plugin-compression2";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      threshold: 1024,
    }),
  ],
  define: {
    "import.meta.env.VITE_APP_FIREBASE_API_KEY": JSON.stringify(
      process.env.VITE_APP_FIREBASE_API_KEY
    ),
    "import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN": JSON.stringify(
      process.env.VITE_APP_FIREBASE_AUTH_DOMAIN
    ),
    "import.meta.env.VITE_APP_FIREBASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_APP_FIREBASE_PROJECT_ID
    ),
    "import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET": JSON.stringify(
      process.env.VITE_APP_FIREBASE_STORAGE_BUCKET
    ),
    "import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
      process.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID
    ),
    "import.meta.env.VITE_APP_FIREBASE_APP_ID": JSON.stringify(
      process.env.VITE_APP_FIREBASE_APP_ID
    ),
    "import.meta.env.VITE_APP_IMP_CODE": JSON.stringify(process.env.VITE_APP_IMP_CODE),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
});
