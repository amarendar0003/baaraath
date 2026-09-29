export interface Service {
  id: string;
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
  active: boolean;
  vendorId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  vendor?: Vendor;
  category?: Category;
  bookings?: Booking[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  services?: Service[];
}

export interface Vendor {
  id: string;
  name: string;
  description?: string;
  city: string;
  address?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  services?: Service[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[];
  vendor?: Vendor;
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  bookingDate: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  createdAt: Date;
  customer?: User;
  service?: Service;
}

export interface Review {
  id: string;
  rating: number;
  body: string;
  reviewerName: string;
  createdAt: Date;
  serviceId: string;
}

export interface ServiceDetailResponse {
  service: Service;
  imageUrls: string[];
  description: string;
  locationLine: string;
  vendorPhone: string;
  vendorEmail: string;
  reviews: ReviewInfo[];
  bookedDates: string[];
}

export interface ReviewInfo {
  name: string;
  rating: number;
  body: string;
  date: string;
}

export interface BookingResult {
  confirmationNumber?: string;
  serviceName?: string;
  status?: string;
  error?: string;
  id?: number;
  customerName?: string;
  customerPhone?: string;
  eventDate?: string;
  guestCount?: number;
  totalAmount?: number;
  advanceAmount?: number;
  cancellationRequested?: boolean;
}

export interface CreateBookingPayload {
  serviceSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  guestCount: number;
  totalAmount: number;
  specialRequests?: string;
  termsAccepted: boolean;
}
