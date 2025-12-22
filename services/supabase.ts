import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://geqslvanwkvmvipyqlcq.supabase.co';

// CUIDADO: Cole a chave exata que você copiou do Supabase aqui dentro das aspas
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXNsdmFud2t2bXZpcHlxbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDY1MjIsImV4cCI6MjA4MTUyMjUyMn0.t7CXGrGBa6FA_0Wvav4n3bJZZcFOOlOHqmJgg56vH9k'; 

export const supabase = createClient(supabaseUrl, supabaseKey);
