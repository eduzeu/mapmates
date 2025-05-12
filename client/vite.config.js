import react from '@vitejs/plugin-react';
import { config } from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
config({ path: envPath });

// https://vite.dev/config/
export default defineConfig({
  define: {
    cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET
  },
  plugins: [react()],
})
