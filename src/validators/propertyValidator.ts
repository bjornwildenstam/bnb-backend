// Zod-schemat validerar inkommande JSON i POST/PUT.
// Gör API:t robust och ger tydliga fel (400) vid felaktig body.

import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

export const newPropertySchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional().nullable(),
  location: z.string().min(1, 'Location required'),
  price_per_night: z.number().nonnegative(),
  availability: z.boolean().optional().nullable()
}).strict()

export const propertyValidator = zValidator('json', newPropertySchema, (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.issues }, 400)
  }
})