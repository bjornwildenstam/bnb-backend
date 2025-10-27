import type { User } from '@supabase/supabase-js'

export type AppBindings = {
  Variables: {
    user: User | null
  }
}