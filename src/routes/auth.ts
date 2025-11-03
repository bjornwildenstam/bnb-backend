import { Hono } from "hono"
import type { AppBindings } from "../types/context.js"
import { supabase } from "../lib/supabase.js"

const auth = new Hono<AppBindings>()

// POST /auth/signup  { name, email, password }
auth.post("/signup", async (c) => {
  const { name, email, password } = await c.req.json()

  // 1) Försök skapa konto
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  // 2) Vanliga fel: user finns redan, för kort lösen etc.
  if (error) {
    // Gör felmeddelandet tydligt uppåt
    return c.json({ message: error.message }, 400)
  }

  // 3) Om e-postbekräftelse är AV → får vi oftast en session direkt
  if (data.session?.access_token) {
    return c.json({ token: data.session.access_token })
  }

  // 4) Om e-postbekräftelse är PÅ → ingen session ännu → prova sign in direkt
  //    (fungerar bara om projektet är satt så att login inte kräver verifierad e-post)
  const signin = await supabase.auth.signInWithPassword({ email, password })
  if (signin.data?.session?.access_token) {
    return c.json({ token: signin.data.session.access_token })
  }

  // 5) Sista utväg: be användaren verifiera e-post
  return c.json({ message: "Signup ok. Please verify your email to sign in." })
})

// POST /auth/signin  { email, password }
auth.post("/signin", async (c) => {
  const { email, password } = await c.req.json()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) {
    return c.json({ message: error?.message ?? "Invalid credentials" }, 401)
  }
  return c.json({ token: data.session.access_token })
})

// GET /auth/me
auth.get("/me", (c) => {
  const user = c.get("user")
  if (!user) return c.json({ message: "Unauthorized" }, 401)
  return c.json(user)
})

export default auth