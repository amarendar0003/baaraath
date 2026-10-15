import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
        <p className="text-sm font-medium text-slate-500">Baaraath</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: October 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Information you provide
            </h2>
            <p className="mt-2">
              Baaraath processes the account details you submit, such as your
              name, email address, and phone number. Provider accounts also
              include business details. When you request a booking, we process
              the service, event date, contact details, and any notes you
              provide.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              How information is used and shared
            </h2>
            <p className="mt-2">
              We use this information to operate accounts, display listings,
              handle booking requests, and provide support. Booking details
              are shared with the relevant provider so they can respond to and
              fulfil the request. We also rely on the platform&apos;s hosting
              and database services to operate Baaraath.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Location and security
            </h2>
            <p className="mt-2">
              If you allow browser location access, Baaraath may use an
              approximate city to help find services near you. You can deny
              permission and choose a location manually. We use reasonable
              safeguards to protect account information, but no online service
              can guarantee absolute security.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-950">
              Your choices and contact
            </h2>
            <p className="mt-2">
              You can update profile information through your account. To ask
              about, correct, or request deletion of personal information,
              contact{" "}
              <a
                className="font-medium text-amber-700 underline"
                href="mailto:support@baaraath.com"
              >
                support@baaraath.com
              </a>
              . Requests may be subject to applicable legal or operational
              requirements. This plain-language summary should be reviewed
              against Baaraath&apos;s actual data practices and applicable law.
            </p>
          </section>
        </div>

        <Link
          href="/terms"
          className="mt-8 inline-flex font-semibold text-slate-900 hover:underline"
        >
          Read the Terms of Use
        </Link>
      </article>
    </main>
  );
}
