// Appens entrypoint: sätter upp Hono, middleware och mountar våra routes.
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import propertyApp from "./routes/property.js"
import { attachUser } from "./middlewares/auth.js"
import authApp from "./routes/auth.js"
import bookingApp from "./routes/booking.js"

const app = new Hono({ strict: false })

// CORS först
app.use(
  "*",
  cors({
    origin: "*", // lås ner senare när allt funkar
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
)

// Preflight
app.options("*", (c) => c.text("ok"))

// Auth-middleware
app.use("*", attachUser)

// Routes
app.route("/auth", authApp)
app.route("/properties", propertyApp)
app.route("/bookings", bookingApp)
app.get("/", (c) => c.text("Hello from backend!"))

export default app
if (!process.env.VERCEL) {
  serve(
    { fetch: app.fetch, port: Number(process.env.HONO_PORT) || 3000 },
    (info) => console.log(`Server running on: http://localhost:${info.port}`)
  )
}

