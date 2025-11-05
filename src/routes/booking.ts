import { Hono } from "hono"
import type { AppBindings } from "../types/context.js"
import { requireAuth } from "../middlewares/requireAuth.js"
import { supabase, supabaseFor } from "../lib/supabase.js"
import type {
  Booking,
  BookingWithProperty,
  BookingResponse,
  NewBooking,
} from "../types/booking.js"

const app = new Hono<AppBindings>()

function mapBookingRow(row: BookingWithProperty): BookingResponse {
  return {
    id: row.id,
    userId: row.user_id,
    propertyId: row.property_id,
    checkInDate: row.check_in,
    checkOutDate: row.check_out,
    totalPrice: Number(row.total_price),
    createdAt: row.created_at,
    property: row.property
      ? {
          id: row.property.id,
          name: row.property.name,
          location: row.property.location,
          pricePerNight: Number(row.property.price_per_night),
        }
      : undefined,
  }
}

// POST /bookings  
app.post("/", requireAuth, async (c) => {
  const user = c.get("user")!
  const token =
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const body = await c.req.json()
  const propertyId = String(body.propertyId)
  const checkIn = new Date(body.checkInDate)
  const checkOut = new Date(body.checkOutDate)

  if (
    !propertyId ||
    Number.isNaN(checkIn.valueOf()) ||
    Number.isNaN(checkOut.valueOf())
  ) {
    return c.json({ message: "Invalid data" }, 400)
  }
  if (checkOut <= checkIn) {
    return c.json(
      { message: "checkOutDate must be after checkInDate" },
      400
    )
  }

  //  Hämta property för att få pris per natt
  const { data: prop, error: propError } = await supabase
    .from("properties")
    .select("id, price_per_night")
    .eq("id", propertyId)
    .maybeSingle()

  if (propError || !prop) {
    return c.json(
      { message: propError?.message ?? "Property not found" },
      404
    )
  }

  const millisPerDay = 1000 * 60 * 60 * 24
  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / millisPerDay
  )

  if (nights <= 0) {
    return c.json({ message: "Stay must be at least 1 night" }, 400)
  }

  const totalPrice = nights * Number(prop.price_per_night)

  // Bygg payload i DB-format
  const newBooking: NewBooking = {
    user_id: user.id,
    property_id: propertyId,
    check_in: checkIn.toISOString().slice(0, 10),  // "YYYY-MM-DD"
    check_out: checkOut.toISOString().slice(0, 10),
    total_price: totalPrice,
  }

  //  Skapa booking – RLS ser till att user_id = auth.uid()
  const { data, error } = await sb
    .from("bookings")
    .insert(newBooking)
    .select("*")
    .single()

  if (error || !data) {
    return c.json({ message: error?.message ?? "Insert failed" }, 400)
  }

  // här finns ingen property-join, så vi skickar in property: undefined
  const bookingRow: BookingWithProperty = {
    ...(data as Booking),
    property: undefined,
  }

  return c.json(mapBookingRow(bookingRow), 201)
})

// GET /bookings – alla bokningar för inloggad user
app.get("/", requireAuth, async (c) => {
  const token =
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const sb = supabaseFor(token)

  const { data, error } = await sb
    .from("bookings")
    .select(`
      id,
      user_id,
      property_id,
      check_in,
      check_out,
      total_price,
      created_at,
      property:properties (
        id, name, location, price_per_night
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return c.json({ message: error.message }, 400)
  }

  const rows = (data ?? []) as unknown as BookingWithProperty[]
  const list = rows.map(mapBookingRow)
  return c.json(list)
})

export default app