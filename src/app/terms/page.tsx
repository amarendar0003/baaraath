import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
        <p className="text-sm font-medium text-slate-500">Baaraath</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: October 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Using Baaraath
            </h2>
            <p className="mt-2">
              Baaraath helps customers discover event services and send booking
              requests to providers. You must provide accurate account and
              booking information, protect your sign-in credentials, and use
              the platform lawfully.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Booking requests
            </h2>
            <p className="mt-2">
              A booking request is not confirmed until its status is confirmed
              in Baaraath. Providers are responsible for the services they
              offer and for coordinating availability and final arrangements
              with customers. Review the booking status and details before
              relying on a reservation.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Accounts and listings
            </h2>
            <p className="mt-2">
              Customers and providers are responsible for the information they
              submit. Providers must keep service descriptions, prices, and
              availability accurate. We may restrict access to accounts or
              listings that misuse the platform or violate applicable law.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Changes and questions
            </h2>
            <p className="mt-2">
              Platform features and these terms may change as Baaraath
              develops. For questions, contact{" "}
              <a
                className="font-medium text-amber-700 underline"
                href="mailto:support@baaraath.com"
              >
                support@baaraath.com
              </a>
              . This page is a plain-language overview and should receive
              appropriate legal review before being relied on as a complete
              legal agreement.
            </p>
          </section>
        </div>

        <Link
          href="/privacy"
          className="mt-8 inline-flex font-semibold text-slate-900 hover:underline"
        >
          Read the Privacy Policy
        </Link>
      </article>
    </main>
  );
}
