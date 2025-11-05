#  Bnb Backend

- Byggt med **Hono** + **TypeScript**
- **Supabase** för databas + autentisering
- Auth med **JWT (Bearer-token)** från Supabase
- RLS i Supabase för att bara ägare kan ändra sina listings

------------------------------------------------------------------------

## Kör lokalt

1. Klona repot:

   -git clone https://github.com/bjornwildenstam/bnb-backend.git
   -cd bnb-backend

   Installera beroenden:

npm install


Skapa en .env-fil i projektroten (baserad på dina Supabase-uppgifter):

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

------------------------------------------------------------------------

Starta dev-server:

npm run dev

Servern kör då t.ex. på http://localhost:3000.

------------------------------------------------------------------------

Viktiga endpoints

GET /properties – lista alla boenden

POST /properties – skapa (kräver auth)

PUT /properties/:id – uppdatera (ägare)

DELETE /properties/:id – ta bort (ägare)

POST /bookings – skapa bokning (räknar totalpris i backend)

GET /bookings – alla bokningar för inloggad user