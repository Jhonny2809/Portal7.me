import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Carrega variáveis locais (do computador)
  const env = loadEnv(mode, '.', '');
  
  // 2. FUNDAMENTAL: Junta com as variáveis do sistema (da Vercel)
  // Sem isso, a Vercel não consegue ler as chaves que você acabou de adicionar
  const processEnv = { ...process.env, ...env };

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Agora usamos 'processEnv' que tem as chaves de verdade
      'process.env.API_KEY': JSON.stringify(processEnv.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(processEnv.GEMINI_API_KEY),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(processEnv.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(processEnv.VITE_SUPABASE_ANON_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
