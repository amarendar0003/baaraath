import Link from "next/link";

export interface ServiceCardProps {
  id: string;
  title: string;
  category: string;
  city: string;
  price: number;
  priceUnit?: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  vendorName?: string;
  slug: string;
}

export default function ServiceCard({
  title,
  category,
  city,
  price,
  priceUnit = "",
  rating,
  reviewCount,
  imageUrl,
  vendorName,
  slug,
}: ServiceCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#eee7e0] bg-white shadow-[0_2px_12px_rgba(60,38,51,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_18px_40px_rgba(60,38,51,0.10)]">
      <Link href={`/services/${slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f9e5d8] via-[#f8eaf0] to-[#efe4f2]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl transition duration-500 group-hover:scale-110">
              🎪
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-[#75455d] backdrop-blur">
            {category.toUpperCase()}
          </span>
          {rating >= 4.5 && (
            <span className="absolute right-3 top-3 rounded-full bg-[#f3d69a] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#452137]">
              ★ TOP RATED
            </span>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-base font-extrabold text-[#3d303c] line-clamp-1">
            {title}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#786d76]">
            <span aria-hidden="true" className="text-sm">⌖</span>
            {city}
            {vendorName && <span className="text-[#e9dfd7]">|</span>}
            {vendorName && <span>{vendorName}</span>}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <div>
              <span className="text-lg font-black text-[#8b3b5e]">
                {formattedPrice}
              </span>
              {priceUnit && (
                <span className="text-xs text-[#786d76]"> {priceUnit}</span>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-[#fbf7f2] px-2.5 py-1">
              <span aria-hidden="true" className="text-sm text-[#b8873b]">
                ★
              </span>
              <span className="text-sm font-extrabold text-[#3d303c]">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-[#786d76]">
                ({reviewCount})
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
