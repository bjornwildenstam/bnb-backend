// REST API-endpoints för properties: GET/POST/PUT/DELETE.
// Notera att POST/PUT/DELETE kräver auth (Bearer-token) pga requireAuth.

import { Hono } from 'hono'
import { requireAuth } from '../middlewares/auth.js'
import { propertyValidator } from '../validators/propertyValidator.js'
import { supabase, supabaseWithAuth } from '../lib/supabase.js'
import type { NewProperty, Property } from '../types/property.js'
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../database/property.js'

const propertyApp = new Hono()

// -------------------- GET /properties (publik) --------------------
propertyApp.get('/', async (c) => {
  try {
    const items: Property[] = await getProperties(supabase) // anon-klient räcker
    return c.json(items)
  } catch {
    return c.json({ error: 'Failed to fetch properties' }, 500)
  }
})

// -------------------- GET /properties/:id (publik) --------------------
propertyApp.get('/:id', async (c) => {
  const { id } = c.req.param()
  const item = await getProperty(supabase, id)
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

// -------------------- POST /properties (skapa) --------------------
propertyApp.post('/', requireAuth, propertyValidator, async (c) => {
  const user = c.get('user')! // garanteras av requireAuth
  const token = c.req.header('authorization')!.slice(7)
  const sb = supabaseWithAuth(token)

  const body = c.req.valid('json') as NewProperty
  try {
    const created = await createProperty(sb, body, user.id)
    return c.json(created, 201)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create property'
    return c.json({ error: msg }, 400)
  }
})

// -------------------- PUT /properties/:id (uppdatera) --------------------
propertyApp.put('/:id', requireAuth, propertyValidator, async (c) => {
  const { id } = c.req.param()
  const token = c.req.header('authorization')!.slice(7)
  const sb = supabaseWithAuth(token)

  const body = c.req.valid('json') as NewProperty
  const updated = await updateProperty(sb, id, body)
  if (!updated) return c.json({ error: 'Failed to update property' }, 400)

  return c.json(updated)
})

// -------------------- DELETE /properties/:id (ta bort) --------------------
propertyApp.delete('/:id', requireAuth, async (c) => {
  const { id } = c.req.param()
  const token = c.req.header('authorization')!.slice(7)
  const sb = supabaseWithAuth(token)

  const deleted = await deleteProperty(sb, id)
  if (!deleted) return c.json({ error: 'Failed to delete property' }, 400)

  return c.json({ ok: true })
})

export default propertyApp