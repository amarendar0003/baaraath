"use client";

import { useState } from "react";
import Link from "next/link";

const popularCities = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

export default function LocationPage() {
  const [selected, setSelected] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    localStorage.setItem("baaraath_location", selected);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <nav className="mb-6 text-sm text-[#786d76]">
        <Link href="/" className="hover:text-[#8b3b5e]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[#342433]">Set Location</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-[#342433]">
          Choose your city
        </h1>
        <p className="mt-2 text-sm text-[#786d76]">
          We will show services available in your selected city.
        </p>

        <div className="mt-8 rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
          <label className="block text-sm font-bold text-[#342433]">
            Select City
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm text-[#342433] outline-none focus:border-[#8b3b5e]"
          >
            <option value="">Choose a city...</option>
            {popularCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={!selected}
            className="mt-4 w-full rounded-xl bg-[#55243f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#6b2d50] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? "Location Saved!" : "Save Location"}
          </button>
        </div>

        <p className="mt-4 text-xs text-[#8b7e88]">
          Your location helps us show relevant services and availability in your area.
        </p>
      </div>
    </div>
  );
}
