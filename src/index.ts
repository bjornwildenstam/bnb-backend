// Appens entrypoint: sätter upp Hono, middleware och mountar våra routes.
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"

import propertyApp from "./routes/property.js"
import authApp from "./routes/auth.js"          // ✅ lägg till importen
import { attachUser } from "./middlewares/auth.js"
import type { AppBindings } from "./types/context.js"

const app = new Hono<AppBindings>({ strict: false })   // ✅ typa appen

// ✅ CORS först (tillfälligt öppet under felsökning)
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
)

// ✅ Preflight-OPTIONS ska alltid få 200
app.options("*", (c) => c.text("ok"))

app.use("*", attachUser)

// ✅ Mounta routes
app.route("/auth", authApp)               // ✅ nu finns authApp
app.route("/properties", propertyApp)

app.get("/", (c) => c.text("Hello from backend!"))

serve(
  { fetch: app.fetch, port: Number(process.env.HONO_PORT) || 3000 },
  (info) => console.log(`Server running on: http://localhost:${info.port}`)
)

