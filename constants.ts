
// Supabase Configuration
export const SUPABASE_URL = 'https://geqslvanwkvmvipyqlcq.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcXNsdmFud2t2bXZpcHlxbGNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NDY1MjIsImV4cCI6MjA4MTUyMjUyMn0.t7CXGrGBa6FA_0Wvav4n3bJZZcFOOlOHqmJgg56vH9k';

/**
 * MERCADO PAGO - CONFIGURAÇÃO
 * 
 * 1. PUBLIC_KEY (Abaixo): Pode ficar no frontend. Começa com "APP_USR-" ou "TEST-".
 * 
 * 2. ACCESS_TOKEN (O do código PHP): JAMAIS deve ser colocado aqui.
 *    Ele deve ser configurado no painel do Supabase como uma variável de ambiente (Secret)
 *    para a Edge Function "create-payment".
 */
export const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-718ad51a-dcb9-4a2a-8cfa-dfbea0f38a0c';

export const CURRENCY_FORMAT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
