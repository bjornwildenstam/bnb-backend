// Hur raden ser ut i databasen
export interface NewBooking {
  user_id: string
  property_id: string
  check_in: string        
  check_out: string       
  total_price: number
}

export interface Booking extends NewBooking {
  id: string
  created_at: string      
}

// Property-information som joinas in vid SELECT
export interface BookingProperty {
  id: string
  name: string
  location: string
  price_per_night: number
}

// Booking-rad 
export interface BookingWithProperty extends Booking {
  property?: BookingProperty | null
}

// Det som frontend får tillbaka från API:t
export interface BookingResponse {
  id: string
  userId: string
  propertyId: string
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  createdAt: string
  property?: {
    id: string
    name: string
    location: string
    pricePerNight: number
  }
}