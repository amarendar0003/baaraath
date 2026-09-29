"use client";

import { useState } from "react";
import Link from "next/link";

type LookupMode = "confirmation" | "namePhone";

export default function BookingLookupPage() {
  const [mode, setMode] = useState<LookupMode>("confirmation");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{
    confirmationNumber?: string;
    serviceName?: string;
    status?: string;
    eventDate?: string;
    guestCount?: number;
    totalAmount?: number;
    customerName?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (mode === "confirmation") {
        params.set("confirmation_number", confirmationNumber);
      } else {
        params.set("name", lastName);
        params.set("phone", phone);
      }

      const res = await fetch(`/api/bookings/lookup?${params.toString()}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Unable to reach the booking service right now." });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-2xl px-5 py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-[#786d76]">
            <li>
              <Link href="/" className="transition hover:text-[#8b3b5e]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#3d303c]">Find My Booking</li>
          </ol>
        </nav>

        <div className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)] sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#342433]">Find My Booking</h1>
            <p className="mt-2 text-sm text-[#786d76]">
              Look up your booking using your confirmation number or name and phone number.
            </p>
          </div>

          <div className="mt-6 flex rounded-xl border border-[#eee7e0] bg-[#fbf7f2] p-1">
            <button
              type="button"
              onClick={() => setMode("confirmation")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "confirmation"
                  ? "bg-white text-[#8b3b5e] shadow-sm"
                  : "text-[#786d76] hover:text-[#3d303c]"
              }`}
            >
              Confirmation Number
            </button>
            <button
              type="button"
              onClick={() => setMode("namePhone")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "namePhone"
                  ? "bg-white text-[#8b3b5e] shadow-sm"
                  : "text-[#786d76] hover:text-[#3d303c]"
              }`}
            >
              Name + Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "confirmation" ? (
              <div>
                <label htmlFor="confirmationNumber" className="block text-sm font-semibold text-[#3d303c]">
                  Confirmation Number
                </label>
                <input
                  id="confirmationNumber"
                  type="text"
                  value={confirmationNumber}
                  onChange={(e) => setConfirmationNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                  placeholder="e.g. BAA-ABC123"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-[#3d303c]">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-[#3d303c]">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#55243f] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#6b2d50] disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find Booking"}
            </button>
          </form>

          {result && (
            <div className="mt-6">
              {result.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {result.error}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold tracking-wide text-[#786d76]">
                        CONFIRMATION NUMBER
                      </p>
                      <p className="mt-1 text-xl font-black text-[#8b3b5e]">
                        {result.confirmationNumber}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-extrabold ${getStatusColor(result.status)}`}
                    >
                      {(result.status || "UNKNOWN").toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold text-[#786d76]">SERVICE</p>
                      <p className="mt-1 text-sm font-semibold text-[#3d303c]">
                        {result.serviceName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#786d76]">EVENT DATE</p>
                      <p className="mt-1 text-sm font-semibold text-[#3d303c]">
                        {result.eventDate || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#786d76]">GUESTS</p>
                      <p className="mt-1 text-sm font-semibold text-[#3d303c]">
                        {result.guestCount ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#786d76]">TOTAL AMOUNT</p>
                      <p className="mt-1 text-sm font-semibold text-[#3d303c]">
                        {result.totalAmount
                          ? `₹${result.totalAmount.toLocaleString("en-IN")}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/bookings/lookup?confirmation_number=${result.confirmationNumber}`}
                      className="flex-1 rounded-full border border-[#e8d9df] px-4 py-2.5 text-center text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      className="flex-1 rounded-full bg-[#55243f] px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#6b2d50]"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
