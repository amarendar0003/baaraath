import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-[#786d76]">
            <li>
              <Link href="/" className="transition hover:text-[#8b3b5e]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-[#3d303c]">Privacy Policy</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-black tracking-tight text-[#342433] sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#786d76]">Last updated: September 2025</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#5f5660]">
          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">1. Information We Collect</h2>
            <p className="mt-2">
              We collect information you provide directly, such as your name, email address,
              phone number, and booking details when you create an account or make a booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">2. How We Use Your Information</h2>
            <p className="mt-2">
              We use your information to process bookings, communicate with you about your
              reservations, improve our services, and send relevant updates (with your consent).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">3. Data Sharing</h2>
            <p className="mt-2">
              We share your information with service providers necessary to fulfill your
              booking. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">4. Data Security</h2>
            <p className="mt-2">
              We implement industry-standard security measures to protect your personal
              information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">5. Cookies</h2>
            <p className="mt-2">
              We use cookies to enhance your experience, analyze usage, and assist in our
              marketing efforts. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">6. Your Rights</h2>
            <p className="mt-2">
              You have the right to access, correct, or delete your personal data. Contact us
              at{" "}
              <Link href="/contact" className="text-[#8b3b5e] underline">
                our contact page
              </Link>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">7. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">8. Contact Us</h2>
            <p className="mt-2">
              If you have questions about this Privacy Policy, please reach out at{" "}
              <Link href="/contact" className="text-[#8b3b5e] underline">
                our contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
