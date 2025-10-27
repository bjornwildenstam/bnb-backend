// Endast typer (rensas bort i runtime). Hjälper editor/kompilator.
// Importeras som '../types/property.js' i NodeNext-läge.

export interface NewProperty {
  title: string
  description?: string | null
  location: string
  price_per_night: number
  availability?: boolean | null
}

export interface Property extends NewProperty {
  id: string
  owner_id: string
  created_at: string
}