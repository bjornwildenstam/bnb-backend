// Databaslagret: alla anrop till Supabase/Postgres bor här.
// Routes kallar dessa funktioner, så blir koden ren och testbar.
import type { SupabaseClient, PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Property, NewProperty } from '../types/property.js'

/**
 * Hämta alla properties (kan använda anon-klient för publik läsning).
 */
export async function getProperties(sb: SupabaseClient): Promise<Property[]> {
  const query = sb
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  const response: PostgrestSingleResponse<Property[]> = await query
  return response.data ?? []
}

/**
 * Hämta en specifik property med id (kan använda anon-klient).
 */
export async function getProperty(sb: SupabaseClient, id: string): Promise<Property | null> {
  const query = sb.from('properties').select('*').eq('id', id).single()
  const response: PostgrestSingleResponse<Property> = await query
  if (response.error) return null
  return response.data
}

/**
 * Skapa en property (kräver auth-klient p.g.a. RLS; owner sätts till auth.uid()).
 */
export async function createProperty(
  sb: SupabaseClient,
  data: NewProperty,
  userId: string
): Promise<Property> {
  const payload = { ...data, user_id: userId }
  const query = sb.from('properties').insert(payload).select().single()
  const response: PostgrestSingleResponse<Property> = await query
  if (response.error) throw response.error
  return response.data
}

/**
 * Uppdatera en property (kräver auth-klient; RLS tillåter bara ägaren).
 */
export async function updateProperty(
  sb: SupabaseClient,
  id: string,
  data: NewProperty
): Promise<Property | null> {
  const query = sb.from('properties').update(data).eq('id', id).select().single()
  const response: PostgrestSingleResponse<Property> = await query
  if (response.error) return null
  return response.data
}

/**
 * Ta bort en property (kräver auth-klient; RLS tillåter bara ägaren).
 */
export async function deleteProperty(sb: SupabaseClient, id: string): Promise<Property | null> {
  const query = sb.from('properties').delete().eq('id', id).select().single()
  const response: PostgrestSingleResponse<Property> = await query
  if (response.error) return null
  return response.data
}