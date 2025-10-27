import 'dotenv/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_ANON_KEY!

// Anon-klienten kan du fortsätta använda för öppna SELECTs
export const supabase = createClient(url, key)

// Skapa en klient som skickar Authorization: Bearer <token> på varje query
export const supabaseWithAuth = (token: string): SupabaseClient =>
  createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })