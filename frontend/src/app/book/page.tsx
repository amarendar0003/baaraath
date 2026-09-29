"use client";

import { useState, Suspense } from "react";
import Link from "next/link";

const steps = [
  { id: 1, label: "Service" },
  { id: 2, label: "Details" },
  { id: 3, label: "Event Info" },
  { id: 4, label: "Requests" },
  { id: 5, label: "Confirm" },
];

const sampleService = {
  title: "Royal Grand Banquet Hall",
  slug: "royal-grand-banquet-hall",
  category: "Banquet Hall",
  city: "Hyderabad",
  price: 150000,
  priceUnit: "/ day",
};

function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    guestCount: "",
    specialRequests: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Enter a valid email";
      if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    }

    if (step === 3) {
      if (!formData.eventDate) newErrors.eventDate = "Event date is required";
      if (!formData.guestCount || parseInt(formData.guestCount) < 1)
        newErrors.guestCount = "Enter a valid guest count";
    }

    if (step === 4) {
      if (!formData.termsAccepted)
        newErrors.termsAccepted = "You must accept the terms to proceed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setDirection("forward");
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const goBack = () => {
    setDirection("backward");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: sampleService.slug,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          eventDate: formData.eventDate,
          guestCount: parseInt(formData.guestCount),
          totalAmount: sampleService.price,
          specialRequests: formData.specialRequests,
          termsAccepted: formData.termsAccepted,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setConfirmationNumber(data.confirmationNumber || "BAA-" + Math.random().toString(36).substring(2, 10).toUpperCase());
        setSubmitted(true);
        setCurrentStep(5);
      } else {
        setErrors({ submit: data.error || "Failed to create booking. Please try again." });
      }
    } catch {
      setErrors({ submit: "Unable to reach the booking service. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#fffdf9]">
        <div className="mx-auto max-w-2xl px-5 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fbf7f2] text-4xl animate-bounce">
            ✓
          </div>
          <h1 className="mt-6 text-3xl font-black text-[#342433]">Booking Confirmed!</h1>
          <p className="mt-3 text-sm text-[#786d76]">
            Your booking has been placed successfully. We have sent a confirmation email to{" "}
            <span className="font-semibold text-[#3d303c]">{formData.email}</span>.
          </p>
          <div className="mt-6 rounded-2xl border border-[#eee7e0] bg-white p-6 text-left shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
            <p className="text-xs font-bold tracking-wide text-[#786d76]">CONFIRMATION NUMBER</p>
            <p className="mt-1 text-2xl font-black text-[#8b3b5e]">{confirmationNumber}</p>
            <p className="mt-4 text-xs text-[#786d76]">
              Save this number to check your booking status later.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/bookings/lookup"
              className="rounded-full bg-[#55243f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
            >
              View My Booking
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-[#e8d9df] px-6 py-3 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5]"
            >
              Browse More Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepVariants = {
    enter: (dir: string) => ({ x: dir === "forward" ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({ x: dir === "forward" ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-[#786d76]">
            <li>
              <Link href="/services" className="transition hover:text-[#8b3b5e]">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#3d303c]">Book {sampleService.title}</li>
          </ol>
        </nav>

        <div className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#342433]">Complete Your Booking</h1>
            <p className="mt-1 text-sm text-[#786d76]">
              {sampleService.title} — {sampleService.city}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold transition-all duration-300 ${
                        currentStep >= step.id
                          ? "bg-[#55243f] text-white shadow-md"
                          : "bg-[#fbf7f2] text-[#786d76]"
                      }`}
                    >
                      {currentStep > step.id ? "✓" : step.id}
                    </div>
                    <span
                      className={`mt-1 text-xs font-semibold transition-colors duration-300 ${
                        currentStep >= step.id ? "text-[#3d303c]" : "text-[#786d76]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-8 sm:w-16 transition-all duration-300 ${
                        currentStep > step.id ? "bg-[#55243f]" : "bg-[#eee7e0]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {errors.submit && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-pulse">
              {errors.submit}
            </div>
          )}

          <div className="transition-all duration-300">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-[#3d303c]">Service Summary</h2>
                <div className="rounded-xl border border-[#eee7e0] bg-[#fbf7f2] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-[#3d303c]">
                        {sampleService.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#786d76]">
                        {sampleService.category} • {sampleService.city}
                      </p>
                    </div>
                    <span className="text-lg font-black text-[#8b3b5e]">
                      ₹{sampleService.price.toLocaleString("en-IN")}
                      <span className="text-xs font-semibold text-[#786d76]">
                        {sampleService.priceUnit}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-[#3d303c]">Customer Details</h2>
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#3d303c]">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.name ? "border-red-300 bg-red-50" : "border-[#eee7e0] bg-white"
                    } focus:border-[#8b3b5e]`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#3d303c]">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.email ? "border-red-300 bg-red-50" : "border-[#eee7e0] bg-white"
                    } focus:border-[#8b3b5e]`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-[#3d303c]">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.phone ? "border-red-300 bg-red-50" : "border-[#eee7e0] bg-white"
                    } focus:border-[#8b3b5e]`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-[#3d303c]">Event Date & Guest Count</h2>
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-semibold text-[#3d303c]">
                    Event Date *
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => updateField("eventDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.eventDate ? "border-red-300 bg-red-50" : "border-[#eee7e0] bg-white"
                    } focus:border-[#8b3b5e]`}
                  />
                  {errors.eventDate && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.eventDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-semibold text-[#3d303c]">
                    Estimated Guest Count *
                  </label>
                  <input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) => updateField("guestCount", e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                      errors.guestCount ? "border-red-300 bg-red-50" : "border-[#eee7e0] bg-white"
                    } focus:border-[#8b3b5e]`}
                    placeholder="Number of guests"
                  />
                  {errors.guestCount && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.guestCount}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-[#3d303c]">Special Requests & Terms</h2>
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-semibold text-[#3d303c]">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => updateField("specialRequests", e.target.value)}
                    rows={4}
                    className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                    placeholder="Any special requirements, decorations, or arrangements..."
                  />
                </div>
                <div className="rounded-xl border border-[#eee7e0] bg-[#fbf7f2] p-4">
                  <h3 className="text-sm font-extrabold text-[#3d303c]">Booking Summary</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#786d76]">Service</span>
                      <span className="font-semibold text-[#3d303c]">{sampleService.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d76]">Customer</span>
                      <span className="font-semibold text-[#3d303c]">{formData.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d76]">Event Date</span>
                      <span className="font-semibold text-[#3d303c]">
                        {formData.eventDate || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d76]">Guests</span>
                      <span className="font-semibold text-[#3d303c]">
                        {formData.guestCount || "—"}
                      </span>
                    </div>
                    <div className="border-t border-[#eee7e0] pt-2 flex justify-between">
                      <span className="font-extrabold text-[#3d303c]">Total Amount</span>
                      <span className="text-lg font-black text-[#8b3b5e]">
                        ₹{sampleService.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => updateField("termsAccepted", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#eee7e0] text-[#55243f] focus:ring-[#8b3b5e]"
                  />
                  <span className="text-xs text-[#786d76]">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#8b3b5e] underline">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#8b3b5e] underline">
                      Privacy Policy
                    </Link>
                    . I confirm the above details are correct.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-red-600">{errors.termsAccepted}</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={goBack}
              disabled={currentStep === 1}
              className="rounded-full border border-[#e8d9df] px-6 py-3 text-sm font-bold text-[#80435e] transition hover:bg-[#fbf1f5] disabled:opacity-40"
            >
              Back
            </button>
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-[#55243f] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full bg-[#f3d69a] px-8 py-3 text-sm font-extrabold text-[#452137] transition hover:bg-[#ffe4ae] disabled:opacity-50"
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
        <div className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]">
          <div className="mb-6">
            <div className="h-8 w-48 animate-pulse rounded bg-[#fbf7f2]" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[#fbf7f2]" />
          </div>
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-xl bg-[#fbf7f2]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<BookLoading />}>
      <BookPageInner />
    </Suspense>
  );
}

function BookPageInner() {
  return <BookingForm />;
}
