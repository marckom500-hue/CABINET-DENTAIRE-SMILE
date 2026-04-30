import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Variables Supabase manquantes. Copie .env.example → .env et remplis tes clés.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '')
