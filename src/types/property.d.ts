// Endast typer (rensas bort i runtime). Hjälper editor/kompilator.
// Importeras som '../types/property.js' i NodeNext-läge.

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