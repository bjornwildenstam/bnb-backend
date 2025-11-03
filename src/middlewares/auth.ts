// Middleware för auth:
// 1) attachUser: läser Authorization: Bearer <token>, hämtar user från Supabase och sätter c.set('user', user)
// 2) requireAuth: stoppar request om ingen user hittas
import type { MiddlewareHandler } from "hono"
import type { AppBindings } from "../types/context.js"
import { supabase } from "../lib/supabase.js"

export const attachUser: MiddlewareHandler<AppBindings> = async (c, next) => {
  const auth = c.req.header("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""

  if (!token) {
    c.set("user", null)
    return next()
  }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    c.set("user", null)
    return next()
  }

  const u = data.user
  c.set("user", {
    id: u.id,
    email: u.email ?? "",
    name: (u.user_metadata as any)?.name ?? u.email ?? "",
  })

  await next()
}