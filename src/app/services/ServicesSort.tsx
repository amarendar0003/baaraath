"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ServicesSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "latest";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "latest") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    const query = params.toString();

    router.push(
      query ? `${pathname}?${query}` : pathname
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label
        htmlFor="sort"
        className="text-sm font-semibold text-slate-900"
      >
        Sort By
      </label>

      <select
        id="sort"
        name="sort"
        value={currentSort}
        onChange={(event) => handleChange(event.target.value)}
        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
      >
        <option value="latest">Latest</option>
        <option value="price_low">Price: Low to High</option>
        <option value="price_high">Price: High to Low</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
}
