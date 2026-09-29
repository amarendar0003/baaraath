import Link from "next/link";

export interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string;
  color: string;
  count?: number;
}

export default function CategoryCard({
  name,
  slug,
  icon,
  color,
  count,
}: CategoryCardProps) {
  return (
    <Link
      href={`/services?category=${slug}`}
      className="group rounded-2xl border border-[#eee7e0] bg-white p-4 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)] transition hover:-translate-y-1 hover:border-[#d8b9c6] hover:shadow-[0_12px_28px_rgba(60,38,51,0.09)]"
    >
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-3xl transition group-hover:scale-105`}
      >
        <span aria-hidden="true">{icon}</span>
      </div>
      <h3 className="mt-3 text-sm font-extrabold text-[#3d303c]">
        {name}
      </h3>
      <p className="mt-1 text-xs text-[#9a8e98]">
        {count !== undefined ? `${count} services` : "Explore →"}
      </p>
    </Link>
  );
}
