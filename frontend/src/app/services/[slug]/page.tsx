import { notFound } from "next/navigation";
import Link from "next/link";
import ServiceCard, { ServiceCardProps } from "@/components/ServiceCard";

const sampleService: ServiceCardProps = {
  id: "1",
  title: "Royal Grand Banquet Hall",
  category: "Banquet Hall",
  slug: "royal-grand-banquet-hall",
  city: "Hyderabad",
  price: 150000,
  priceUnit: "/ day",
  rating: 4.7,
  reviewCount: 124,
  imageUrl: "",
  vendorName: "Grand Events",
};

const relatedServices: ServiceCardProps[] = [
  {
    id: "2",
    title: "Harmony Music Band",
    category: "Music Band",
    slug: "harmony-music-band",
    city: "Mumbai",
    price: 50000,
    priceUnit: "/ event",
    rating: 4.5,
    reviewCount: 89,
    imageUrl: "",
    vendorName: "Melody Makers",
  },
  {
    id: "3",
    title: "Elite Catering Services",
    category: "Catering",
    slug: "elite-catering-services",
    city: "Delhi",
    price: 800,
    priceUnit: "/ plate",
    rating: 4.8,
    reviewCount: 210,
    imageUrl: "",
    vendorName: "Elite Foods",
  },
  {
    id: "4",
    title: "Luxury Hotel Venue",
    category: "Hotels",
    slug: "luxury-hotel-venue",
    city: "Bangalore",
    price: 250000,
    priceUnit: "/ day",
    rating: 4.6,
    reviewCount: 156,
    imageUrl: "",
    vendorName: "Premium Stays",
  },
];

const amenities = [
  "Air Conditioning",
  "Parking Available",
  "Catering Allowed",
  "Sound System",
  "Stage",
  "Changing Rooms",
  "Security",
  "Power Backup",
];

const reviews = [
  {
    name: "Priya Sharma",
    rating: 5,
    date: "2025-08-15",
    body: "Excellent venue! The staff was very professional and the space was immaculate. Highly recommended for weddings.",
  },
  {
    name: "Rahul Verma",
    rating: 4,
    date: "2025-07-22",
    body: "Great location and amenities. The booking process was smooth. Would book again.",
  },
  {
    name: "Anjali Reddy",
    rating: 5,
    date: "2025-06-10",
    body: "Absolutely loved the venue. Perfect for our corporate event. The team was very accommodating.",
  },
];

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;

  if (slug !== sampleService.slug) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-[#786d76]">
            <li>
              <Link href="/" className="transition hover:text-[#8b3b5e]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/services" className="transition hover:text-[#8b3b5e]">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#3d303c]">{sampleService.title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="overflow-hidden rounded-3xl border border-[#eee7e0] bg-gradient-to-br from-[#f9e5d8] via-[#f8eaf0] to-[#efe4f2]">
              <div className="flex aspect-[16/9] items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl" aria-hidden="true">🎪</div>
                  <p className="mt-4 text-sm font-semibold text-[#786d76]">
                    Image Gallery Placeholder
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h1 className="text-3xl font-black tracking-tight text-[#342433] sm:text-4xl">
                {sampleService.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#786d76]">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true">⌖</span>
                  {sampleService.city}
                </span>
                <span className="text-[#e9dfd7]">|</span>
                <span>{sampleService.category}</span>
                <span className="text-[#e9dfd7]">|</span>
                <span className="flex items-center gap-1.5 text-[#b8873b]">
                  <span aria-hidden="true">★</span>
                  <span className="font-bold text-[#3d303c]">
                    {sampleService.rating.toFixed(1)}
                  </span>
                  <span>({sampleService.reviewCount} reviews)</span>
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-extrabold text-[#3d303c]">About</h2>
              <p className="mt-3 text-sm leading-7 text-[#5f5660]">
                Experience exceptional event services at {sampleService.title}. Located in{" "}
                {sampleService.city}, we offer premium facilities and professional service
                to make your special occasion unforgettable. Our team is dedicated to
                ensuring every detail is perfect for your celebration.
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-extrabold text-[#3d303c]">Amenities & Features</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm font-semibold text-[#3d303c]"
                  >
                    <span className="text-[#8b3b5e]" aria-hidden="true">✓</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-extrabold text-[#3d303c]">
                Reviews ({reviews.length})
              </h2>
              <div className="mt-4 space-y-4">
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#eee7e0] bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-extrabold text-[#3d303c]">
                          {review.name}
                        </p>
                        <p className="text-xs text-[#786d76]">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-[#fbf7f2] px-2.5 py-1">
                        <span className="text-sm text-[#b8873b]" aria-hidden="true">★</span>
                        <span className="text-sm font-extrabold text-[#3d303c]">
                          {review.rating}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#5f5660]">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-extrabold text-[#3d303c]">
                Availability Calendar
              </h2>
              <p className="mt-2 text-sm text-[#786d76]">
                Check available dates for your event. Contact the vendor for exact availability.
              </p>
              <div className="mt-4 rounded-2xl border border-dashed border-[#e9dfd7] bg-[#fbf7f2] p-8 text-center">
                <p className="text-sm font-semibold text-[#786d76]">
                  Calendar placeholder — integrate with vendor availability API for live booking.
                </p>
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#8b3b5e]">
                    ₹{sampleService.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-[#786d76]">{sampleService.priceUnit}</span>
                </div>
                <p className="mt-1 text-xs text-[#786d76]">
                  Starting price. Final quote depends on guest count and requirements.
                </p>

                <div className="mt-6 space-y-3">
                  <Link
                    href={`/book?service=${sampleService.slug}`}
                    className="flex w-full items-center justify-center rounded-full bg-[#55243f] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
                  >
                    Book Now
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-full border border-[#e8d9df] px-6 py-3.5 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]"
                  >
                    Enquire
                  </button>
                </div>

                <div className="mt-6 border-t border-[#eee7e0] pt-4">
                  <h3 className="text-sm font-extrabold text-[#3d303c]">Vendor Info</h3>
                  <p className="mt-2 text-sm font-semibold text-[#3d303c]">
                    {sampleService.vendorName}
                  </p>
                  <p className="mt-1 text-xs text-[#786d76]">
                    Professional event services provider with years of experience.
                  </p>
                </div>

                <div className="mt-4 border-t border-[#eee7e0] pt-4">
                  <h3 className="text-sm font-extrabold text-[#3d303c]">Cancellation Policy</h3>
                  <p className="mt-2 text-xs leading-5 text-[#786d76]">
                    Free cancellation up to 7 days before the event. 50% refund for
                    cancellations between 3-7 days. No refund within 3 days of the event.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-black tracking-tight text-[#342433]">
            Related Services
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((service) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
