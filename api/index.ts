// api/index.ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"

import propertyApp from "../src/routes/property.js"
import { attachUser } from "../src/middlewares/auth.js"
// import authApp from "../src/routes/auth.js" // om du har auth-routen

// Skapa appen
const app = new Hono({ strict: false })

// CORS först
app.use("*", cors({
  origin: "*",  // byt till ["http://localhost:5173", "https://din-frontend.vercel.app"] sen
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}))
app.options("*", (c) => c.text("ok"))

// Middleware + routes
app.use("*", attachUser)
app.route("/properties", propertyApp)
// if (authApp) app.route("/auth", authApp)

app.get("/", (c) => c.text("Hello from backend!"))

// Exportera för Vercel
export const runtime = "nodejs20.x"
export default handle(app)
