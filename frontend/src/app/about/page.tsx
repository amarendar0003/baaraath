import Link from "next/link";

const values = [
  {
    title: "Trust & Transparency",
    description:
      "We believe in clear pricing, honest vendor profiles, and a booking process you can rely on.",
  },
  {
    title: "Celebrations for All",
    description:
      "From intimate gatherings to grand weddings, we make event planning accessible to everyone.",
  },
  {
    title: "Quality First",
    description:
      "Every provider on Baaraath is vetted to ensure you receive the quality you deserve.",
  },
  {
    title: "Community Driven",
    description:
      "We build lasting relationships with vendors and customers to create a thriving event ecosystem.",
  },
];

const team = [
  { name: "Rahul Sharma", role: "Founder & CEO", initials: "RS" },
  { name: "Priya Patel", role: "Head of Product", initials: "PP" },
  { name: "Arun Kumar", role: "Head of Operations", initials: "AK" },
  { name: "Sneha Reddy", role: "Customer Success Lead", initials: "SR" },
];

export default function AboutPage() {
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
            <li className="font-semibold text-[#3d303c]">About Us</li>
          </ol>
        </nav>

        <section className="rounded-3xl border border-[#eee7e0] bg-gradient-to-br from-[#f9e5d8] via-[#f8eaf0] to-[#efe4f2] px-8 py-16 text-center sm:px-12 sm:py-20">
          <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">ABOUT BAARAATH</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-[#342433] sm:text-5xl">
            Making event planning beautiful, one celebration at a time.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#5f5660] sm:text-lg">
            Baaraath is India&apos;s trusted event booking platform, connecting people with
            the best venues, caterers, entertainers, and planners for every occasion.
          </p>
        </section>

        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">OUR STORY</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
              Born from a personal frustration
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5f5660]">
              Baaraath started when our founders struggled to find the perfect venue for a family
              wedding. After calling dozens of vendors, visiting multiple locations, and comparing
              endless options, they realized there had to be a better way. Today, Baaraath brings
              together thousands of trusted event service providers on one platform, making it easy
              to discover, compare, and book the perfect services for your special day.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold tracking-[0.2em] text-[#a16a43]">OUR MISSION</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
              To simplify event planning for everyone
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5f5660]">
              We aim to make event planning accessible, transparent, and enjoyable. Whether
              you&apos;re planning a small birthday party or a grand wedding, Baaraath is here to
              help you find the right services at the right price, with the confidence that every
              provider meets our quality standards.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
            Our Values
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-[#eee7e0] bg-white p-6 shadow-[0_4px_18px_rgba(60,38,51,0.04)]"
              >
                <h3 className="text-base font-extrabold text-[#3d303c]">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#786d76]">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-black tracking-tight text-[#342433] sm:text-3xl">
            Meet the Team
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#786d76]">
            A passionate team dedicated to making your events unforgettable.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-[#eee7e0] bg-white p-6 text-center shadow-[0_4px_18px_rgba(60,38,51,0.04)]"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fbf7f2] text-2xl font-black text-[#8b3b5e]">
                  {member.initials}
                </div>
                <h3 className="mt-4 text-base font-extrabold text-[#3d303c]">{member.name}</h3>
                <p className="text-sm text-[#786d76]">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="overflow-hidden rounded-[2rem] bg-[#55243f] px-8 py-12 text-center text-white sm:px-12 sm:py-16">
            <h2 className="text-2xl font-black sm:text-4xl">
              Ready to plan your next event?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Join thousands of happy customers who have planned their perfect events with Baaraath.
            </p>
            <Link
              href="/services"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[#f3d69a] px-7 py-3 text-sm font-extrabold text-[#452137] transition hover:bg-[#ffe4ae]"
            >
              Explore Services <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
