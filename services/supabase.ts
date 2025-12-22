import { createClient } from '@supabase/supabase-js';

// Tenta pegar a chave do jeito moderno (Vite) ou do jeito clássico (process)
// Isso garante que funcione tanto no seu PC quanto na Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO CRÍTICO: Chaves do Supabase não encontradas!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
