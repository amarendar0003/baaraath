"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch {
      setError("Unable to send message. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-[#786d76]">
            <li>
              <Link href="/" className="transition hover:text-[#8b3b5e]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#3d303c]">Contact</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#342433] sm:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#5f5660]">
              Have a question about our services, need help with a booking, or want to partner
              with us? We would love to hear from you.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fbf7f2] text-xl text-[#8b3b5e]">
                  ✉
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#3d303c]">Email</h3>
                  <p className="mt-1 text-sm text-[#786d76]">support@baaraath.com</p>
                  <p className="text-xs text-[#786d76]">
                    We typically respond within 24 hours.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fbf7f2] text-xl text-[#8b3b5e]">
                  ☏
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#3d303c]">Phone</h3>
                  <p className="mt-1 text-sm text-[#786d76]">+91 98765 43210</p>
                  <p className="text-xs text-[#786d76]">
                    Mon-Sat, 9:00 AM - 7:00 PM IST
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fbf7f2] text-xl text-[#8b3b5e]">
                  ⌖
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#3d303c]">Office</h3>
                  <p className="mt-1 text-sm text-[#786d76]">
                    123 Event Street, Jubilee Hills
                    <br />
                    Hyderabad, Telangana 500033
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)] sm:p-8">
              {submitted ? (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf7f2] text-3xl">
                    ✓
                  </div>
                  <h2 className="mt-4 text-xl font-black text-[#342433]">Message Sent!</h2>
                  <p className="mt-2 text-sm text-[#786d76]">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full bg-[#55243f] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-extrabold text-[#3d303c]">Send us a message</h2>
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[#3d303c]">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                      placeholder="Your name"
                      required
                    />
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
                      className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                      placeholder="you@example.com"
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
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[#3d303c]">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      rows={5}
                      className="mt-1.5 w-full rounded-xl border border-[#eee7e0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8b3b5e]"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-[#55243f] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#6b2d50]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
