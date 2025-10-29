import { Hono } from "hono"

import type { AppBindings } from "../types/context.js"

const auth = new Hono<AppBindings>()   // ✅ typad router

// Byt detta mot din riktiga signin som returnerar { token }
auth.post("/signin", async (c) => {
  return c.json({ token: "demo-token" })
})

// Kräver att attachUser sätter c.set('user', user)
auth.get("/me", (c) => {
  const user = c.get("user")           // ✅ nu är 'user' korrekt typad
  if (!user) return c.json({ message: "Unauthorized" }, 401)
  return c.json(user)
})

export default auth  