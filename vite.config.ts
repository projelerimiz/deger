import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // .env dosyasındaki veya Vercel'deki değişkenleri yükle
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // ÖNEMLİ: Uygulama içinde 'process.env.GEMINI_API_KEY' olarak çağrılmasını sağlar
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // AI Studio veya yerel geliştirme için HMR ayarı
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
