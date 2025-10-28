// Appens entrypoint: sätter upp Hono, middleware och mountar våra routes.
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"

import propertyApp from "./routes/property.js"
import { attachUser } from "./middlewares/auth.js"

const app = new Hono({ strict: false })

// ✅ CORS först
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",  // lägg till FE-prod-URL vid deploy (array funkar också)
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // INTE credentials: true  (vi kör Header-JWT, inte cookies)
  })
)

app.use("*", attachUser)
app.route("/properties", propertyApp)
app.get("/", (c) => c.text("Hello from backend!"))

serve(
  { fetch: app.fetch, port: Number(process.env.HONO_PORT) || 3000 },
  (info) => console.log(`Server running on: http://localhost:${info.port}`)
)

