import Link from "next/link";

export default function TermsPage() {
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
            <li className="font-semibold text-[#3d303c]">Terms of Use</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-black tracking-tight text-[#342433] sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-[#786d76]">Last updated: September 2025</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#5f5660]">
          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using Baaraath (&quot;the Platform&quot;), you agree to be bound by these Terms
              of Use. If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">2. Description of Service</h2>
            <p className="mt-2">
              Baaraath is an online marketplace that connects customers with event service
              providers. We do not employ service providers and are not a party to any
              agreements between customers and providers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">3. User Accounts</h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">4. Bookings & Payments</h2>
            <p className="mt-2">
              All bookings made through the Platform are subject to availability and confirmation
              by the service provider. Prices are indicative and may vary. Payment terms are
              as specified at the time of booking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">5. Cancellations & Refunds</h2>
            <p className="mt-2">
              Cancellation and refund policies vary by service provider. Please review the
              specific terms before booking. Baaraath may facilitate cancellations but is not
              liable for provider-specific refund decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">6. User Conduct</h2>
            <p className="mt-2">
              You agree not to misuse the Platform or help anyone else do so. Prohibited
              activities include fraud, harassment, and unauthorized data collection.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">7. Limitation of Liability</h2>
            <p className="mt-2">
              Baaraath shall not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of the Platform or any services
              booked through it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">8. Changes to Terms</h2>
            <p className="mt-2">
              We reserve the right to modify these terms at any time. Continued use of the
              Platform after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-extrabold text-[#3d303c]">9. Contact Information</h2>
            <p className="mt-2">
              For questions about these Terms, please contact us at{" "}
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
