import type { MiddlewareHandler } from 'hono'
import type { AppBindings } from '../types/context.js'

export const requireAuth: MiddlewareHandler<AppBindings> = async (c, next) => {
  const user = c.get('user')
  if (!user) return c.json({ message: 'Unauthorized' }, 401)
  await next()
}