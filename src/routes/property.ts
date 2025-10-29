// REST API-endpoints för properties: GET/POST/PUT/DELETE.
// Notera att POST/PUT/DELETE kräver auth (Bearer-token) pga requireAuth.

import { Hono } from "hono"
import type { AppBindings } from "../types/context.js"

const app = new Hono<AppBindings>()

app.get("/", async (c) => { /* list */ return c.json([]) })
app.post("/", async (c) => { /* create */ return c.json({ ok: true }) })
app.get("/:id", async (c) => { /* read one */ return c.json({}) })
app.put("/:id", async (c) => { /* update */ return c.json({ ok: true }) })
app.delete("/:id", async (c) => { /* delete */ return c.json({ ok: true }) })

export default app