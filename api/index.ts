// api/index.ts
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { cors } from 'hono/cors'

import propertyApp from '../src/routes/property.js'
import authApp from '../src/routes/auth.js'
import { attachUser } from '../src/middlewares/auth.js'

const app = new Hono({ strict: false })

// CORS – öppet för skolprojekt
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)

// Preflight
app.options('*', (c) => c.text('ok'))

// Auth-middleware (läser Authorization: Bearer <jwt> och sätter c.set('user', ...))
app.use('*', attachUser)

// Routes
app.route('/properties', propertyApp)
app.route('/auth', authApp)

app.get('/', (c) => c.text('Hello from backend (Vercel)!'))

// Vercel runtime (Node serverless)
export const config = {
  runtime: 'nodejs',
}

export default handle(app)