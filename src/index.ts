// Appens entrypoint: sätter upp Hono, middleware och mountar våra routes.
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"

import propertyApp from "./routes/property.js"
import { attachUser } from "./middlewares/auth.js"

const app = new Hono({ strict: false })


app.use(
  "*",
  cors({
    origin: "*", // tillfälligt för att bekräfta CORS
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
)
app.use("*", attachUser)
app.route("/properties", propertyApp)
app.get("/", (c) => c.text("Hello from backend!"))

serve(
  { fetch: app.fetch, port: Number(process.env.HONO_PORT) || 3000 },
  (info) => console.log(`Server running on: http://localhost:${info.port}`)
)

