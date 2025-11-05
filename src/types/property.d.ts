// Endast typer (rensas bort i runtime). Hjälper editor/kompilator.


export interface NewProperty {
  name: string
  description: string
  location: string
  price_per_night: number
  availability: boolean
  imageUrl: string | null
}

export interface Property extends NewProperty {
  id: string
  user_id: string      
  created_at: string
}