// Middleware för auth:
// 1) attachUser: läser Authorization: Bearer <token>, hämtar user från Supabase och sätter c.set('user', user)
// 2) requireAuth: stoppar request om ingen user hittas
import type { MiddlewareHandler } from "hono"
import type { AppBindings } from "../types/context.js"

export const attachUser: MiddlewareHandler<AppBindings> = async (c, next) => {
  const auth = c.req.header("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : ""

  if (token) {
    try {
      // TODO: verifiera token här och hämta riktig user
      const user = { id: "123", email: "test@example.com", name: "Test User" }
      c.set("user", user)          // ✅ sätter typad user i context
    } catch {
      c.set("user", null)
    }
  } else {
    c.set("user", null)
  }

  await next()
}