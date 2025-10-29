// api/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/vercel'

import propertyApp from '../src/routes/property.js'
import { attachUser } from '../src/middlewares/auth.js'
// import authApp from '../src/routes/auth.js' // om du har auth-router

const app = new Hono({ strict: false })

// CORS (öppet nu; lås ner senare)
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))
app.options('*', c => c.text('ok'))

app.use('*', attachUser)
app.route('/properties', propertyApp)
// if (authApp) app.route('/auth', authApp)

app.get('/', c => c.text('Hello from backend!'))

// ✅ Korrekt runtime för Vercel Serverless (inte versionssträng)
export const config = { runtime: 'nodejs' }

export default handle(app)
