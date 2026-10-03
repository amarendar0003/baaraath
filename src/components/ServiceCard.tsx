import Link from "next/link";

type Props = {
  service: {
    id: string;
    title: string;
    description?: string | null;
    price: string | number;
    durationMinutes: number;
    Category?: {
      name: string;
    } | null;
    Vendor?: {
      name: string;
      city: string;
    } | null;
  };
};

export default function ServiceCard({ service }: Props) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            {service.title}
          </h3>

          {service.Category?.name && (
            <p className="mt-1 text-xs font-medium text-indigo-600">
              {service.Category.name}
            </p>
          )}
        </div>

        <span className="whitespace-nowrap font-bold text-slate-900">
          ₹{service.price}
        </span>
      </div>

      {service.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {service.description}
        </p>
      )}

      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>{service.durationMinutes} minutes</span>
        <span>{service.Vendor?.city || "Location unavailable"}</span>
      </div>
    </Link>
  );
}