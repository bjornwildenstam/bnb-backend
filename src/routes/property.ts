// REST API-endpoints för properties: GET/POST/PUT/DELETE.
import { Hono } from "hono"
import type { AppBindings } from "../types/context.js"
import { requireAuth } from "../middlewares/requireAuth.js"
import { supabase, supabaseFor } from "../lib/supabase.js"
import type { Property, NewProperty } from "../types/property.js"

const app = new Hono<AppBindings>()

type PropertyPatch = Partial<NewProperty>

// helper: mappar DB-row -> objekt som frontend använder
function mapProperty(p: Property) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    location: p.location,
    pricePerNight: Number(p.price_per_night),
    availability: Boolean(p.availability),
    createdAt: p.created_at,
    userId: p.user_id,
    imageUrl: p.imageUrl ?? null,
  }
}

// GET /properties – lista alla
app.get("/", async (c) => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")

  if (error) return c.json({ message: error.message }, 400)

  const rows = (data ?? []) as Property[]
  const list = rows.map(mapProperty)

  return c.json(list)
})

// POST /properties – skapa (kräver login + RLS auth.uid())
app.post("/", requireAuth, async (c) => {
  const user = c.get("user")!
  const token =
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const body = await c.req.json()

  const payload: NewProperty = {
    name: String(body.name),
    description: String(body.description ?? ""),
    location: String(body.location),
    price_per_night: Number(body.pricePerNight),
    availability:
      body.availability === undefined
        ? true
        : Boolean(body.availability),
    imageUrl: body.imageUrl ? String(body.imageUrl) : null,
  }

  const { data, error } = await sb
    .from("properties")
    .insert({ ...payload, user_id: user.id })
    .select("*")
    .single()

  if (error || !data) return c.json({ message: error?.message ?? "Error" }, 400)

  return c.json(mapProperty(data as Property), 201)
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

  return c.json(mapProperty(data as Property))
})

// PUT /properties/:id – uppdatera (RLS kräver ägarskap)
app.put("/:id", requireAuth, async (c) => {
  const id = c.req.param("id")
  const user = c.get("user")!
  const token =
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const body = await c.req.json()
  const patch: PropertyPatch = {}

  if (body.name !== undefined) patch.name = String(body.name)
  if (body.description !== undefined)
    patch.description = String(body.description)
  if (body.location !== undefined)
    patch.location = String(body.location)
  if (body.pricePerNight !== undefined)
    patch.price_per_night = Number(body.pricePerNight)
  if (body.availability !== undefined)
    patch.availability = Boolean(body.availability)
  if (body.imageUrl !== undefined)
    patch.imageUrl = body.imageUrl ? String(body.imageUrl) : null

  const { data, error } = await sb
    .from("properties")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle()

  if (error) {
    console.error("UPDATE error:", error.message)
    return c.json({ message: error.message }, 400)
  }
  if (!data) {
    return c.json({ message: "Not found or not allowed" }, 404)
  }

  return c.json(mapProperty(data as Property))
})

// DELETE /properties/:id – radera (RLS kräver ägarskap)
app.delete("/:id", requireAuth, async (c) => {
  const id = c.req.param("id")
  const token =
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const { error } = await sb.from("properties").delete().eq("id", id)
  if (error) return c.json({ message: error.message }, 400)
  return c.body(null, 204)
})

export default app