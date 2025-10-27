import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import propertyApp from '../src/routes/property.js'
import { attachUser } from '../src/middlewares/auth.js'
import { cors } from 'hono/cors'

export const config = { runtime: 'edge' }

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use('*', attachUser)
app.route('/properties', propertyApp)

app.get('/', (c) => c.text('Hello from backend (Vercel)!'))

export default handle(app)