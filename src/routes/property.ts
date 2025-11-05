// REST API-endpoints för properties: GET/POST/PUT/DELETE.
import { Hono } from "hono"
import type { AppBindings } from "../types/context.js"
import { requireAuth } from "../middlewares/requireAuth.js"
import { supabase, supabaseFor } from "../lib/supabase.js"

const app = new Hono<AppBindings>()

// GET /properties – lista alla
app.get("/", async (c) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")

  if (error) return c.json({ message: error.message }, 400)

  const list = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    location: p.location,
    pricePerNight: Number(p.price_per_night),
    availability: p.availability,
    createdAt: p.created_at,
    userId: p.user_id,
    imageUrl: p.imageUrl ?? null,   // ⬅️ läs från imageUrl-kolumnen
  }))

  return c.json(list)
})

// POST /properties – skapa (kräver login + RLS auth.uid())
app.post("/", requireAuth, async (c) => {
  const user = c.get("user")!
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const body = await c.req.json()
  const payload = {
    user_id: user.id,
    name: String(body.name),
    description: String(body.description),
    location: String(body.location),
    price_per_night: Number(body.pricePerNight),
    availability: Boolean(body.availability),
    imageUrl: body.imageUrl ? String(body.imageUrl) : null, 
  }

  const { data, error } = await sb
    .from("properties")
    .insert(payload)
    .select("*")
    .single()

  if (error) return c.json({ message: error.message }, 400)

  return c.json({
    id: data.id,
    name: data.name,
    description: data.description,
    location: data.location,
    pricePerNight: Number(data.price_per_night),
    availability: data.availability,
    createdAt: data.created_at,
    userId: data.user_id,
    imageUrl: data.imageUrl ?? null,       
  }, 201)
})

// GET /properties/:id
app.get("/:id", async (c) => {
  const id = c.req.param("id")

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("GET /properties/:id error:", error.message)
    return c.json({ message: error.message }, 400)
  }
  if (!data) return c.json({ message: "Not found" }, 404)

  return c.json({
    id: data.id,
    name: data.name,
    description: data.description,
    location: data.location,
    pricePerNight: Number(data.price_per_night),
    availability: data.availability,
    createdAt: data.created_at,
    userId: data.user_id,
    imageUrl: data.imageUrl ?? null,       
  })
})

// PUT /properties/:id – uppdatera (RLS kräver ägarskap)
app.put("/:id", requireAuth, async (c) => {
  const id = c.req.param("id")
  const user = c.get("user")!
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const body = await c.req.json()
  const patch: any = {}
  if (body.name !== undefined) patch.name = String(body.name)
  if (body.description !== undefined) patch.description = String(body.description)
  if (body.location !== undefined) patch.location = String(body.location)
  if (body.pricePerNight !== undefined) patch.price_per_night = Number(body.pricePerNight)
  if (body.availability !== undefined) patch.availability = Boolean(body.availability)
  if (body.imageUrl !== undefined) {
    patch.imageUrl = body.imageUrl ? String(body.imageUrl) : null   
  }

  const upd = await sb
    .from("properties")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)

  if (upd.error) {
    console.error("UPDATE error:", upd.error.message)
    return c.json({ message: upd.error.message }, 400)
  }

  // Hämta nuvarande rad (för UI)
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return c.json({ message: error?.message || "Not found" }, 404)

  return c.json({
    id: data.id,
    name: data.name,
    description: data.description,
    location: data.location,
    pricePerNight: Number(data.price_per_night),
    availability: data.availability,
    createdAt: data.created_at,
    userId: data.user_id,
    imageUrl: data.imageUrl ?? null,      
  })
})

// DELETE /properties/:id – radera (RLS kräver ägarskap)
app.delete("/:id", requireAuth, async (c) => {
  const id = c.req.param("id")
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const { error } = await sb.from("properties").delete().eq("id", id)
  if (error) return c.json({ message: error.message }, 400)
  return c.body(null, 204)
})

export default app