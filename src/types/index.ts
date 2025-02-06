export interface Villa {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  maxGuests: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BookingDate {
  checkIn: Date | null;
  checkOut: Date | null;
}