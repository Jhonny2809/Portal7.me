import { createClient } from '@supabase/supabase-js';

// URL do seu banco de dados (Copiado do seu constants.ts)
const supabaseUrl = 'https://geqslvanwkvmvipyqlcq.supabase.co';

// Chave Anon/Public (Copiada do seu constants.ts)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXNsdmFud2t2bXZpcHlxbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5ODQ0MDQsImV4cCI6MjA1MDU2MDQwNH0.t7CXGrgBa6FA_0Wvav4n3bJZzCF0OlOHqmJgg56vH9k';

// Cria a conexão direta, sem depender de importações ou variáveis
export const supabase = createClient(supabaseUrl, supabaseKey);
