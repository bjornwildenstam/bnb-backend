
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const anon = process.env.SUPABASE_ANON_KEY!   

// Bas-klient (utan user-token)
export const supabase = createClient(url, anon)

/* Skapa en klient som skickar med användarens JWT */
export function supabaseFor(token?: string) {
  return createClient(url, anon, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  })
}