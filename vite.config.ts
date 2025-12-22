import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Carrega variáveis de arquivos locais (quando você usa no PC)
  const env = loadEnv(mode, process.cwd(), '');

  // 2. PEGA AS CHAVES REAIS:
  // Tenta pegar direto do sistema (Vercel) OU do arquivo local
  // Isso garante que nunca fique "undefined"
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Passa os valores garantidos para o site
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.API_KEY': JSON.stringify(geminiKey), // Caso o código use esse nome
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      
      // Prevenção extra: Define o objeto process.env vazio para evitar erro de "process is not defined"
      'process.env': {} 
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
