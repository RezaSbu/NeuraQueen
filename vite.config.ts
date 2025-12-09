import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.SUPABASE_URL': JSON.stringify("https://jhjlxljhijhrvclgsbzc.supabase.co"),
        'process.env.SUPABASE_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impoamx4bGpoaWpocnZjbGdzYnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjQ4NzYsImV4cCI6MjA4MDg0MDg3Nn0.8WwtsrOE3Fch_vFczeu6Fz9A2QiO_Pbwh_MxuhFUFwY")
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});