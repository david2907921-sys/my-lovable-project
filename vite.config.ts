import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Fix: Manually define __dirname as it is not available in ESM by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode`. 
    // By default, only variables prefixed with VITE_ are loaded unless the third parameter is empty.
    // Fix: Type casting process to any to avoid TS error about missing cwd property on Process interface
    const env = loadEnv(mode, (process as any).cwd());

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      define: {
        // This maps the Vite-prefixed env variable to the specific name expected by the SDK
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      }
    };
});