// Middleware för auth:
// 1) attachUser: läser Authorization: Bearer <token>, hämtar user från Supabase och sätter c.set('user', user)
// 2) requireAuth: stoppar request om ingen user hittas
import type { Context, Next } from 'hono'
import { supabase } from '../lib/supabase.js'
import type { AppBindings } from '../types/app.js'

export const attachUser = async (c: Context<AppBindings>, next: Next) => {
  const auth = c.req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null

  if (token) {
    const { data } = await supabase.auth.getUser(token)
    if (data?.user) c.set('user', data.user)
  }

  await next()
}

export const requireAuth = async (c: Context<AppBindings>, next: Next) => {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Unauthorized' }, 401)
  await next()
}