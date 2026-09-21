import Link from "next/link";
import { BridgeMark } from "@/components/bridge-mark";

const STEPS = [
  {
    step: "01",
    title: "The kitchen marks what is left",
    body: "A restaurant or hotel lists the trays, bread or produce that will not be sold before closing.",
  },
  {
    step: "02",
    title: "A nearby charity claims it",
    body: "Charities see what is available around them and claim the pickups they can actually serve.",
  },
  {
    step: "03",
    title: "Someone eats tonight",
    body: "Food is collected the same day instead of being thrown away at the end of the shift.",
  },
];

const PROMISES = ["Free for charities", "No middlemen", "Same-day pickups"];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-husk-950/10 bg-canvas/85 backdrop-blur-md">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-basil-800">
            <BridgeMark className="h-9 w-9" />
            <span className="font-display text-lg font-semibold tracking-headline">
              Food&nbsp;Bridge
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-husk-800 md:flex">
            <a className="transition hover:text-basil-800" href="#how-it-works">
              How it works
            </a>
            <a className="transition hover:text-basil-800" href="#who-its-for">
              Who it&apos;s for
            </a>
            <a className="transition hover:text-basil-800" href="#why">
              Why it matters
            </a>
            <Link className="transition hover:text-basil-800" href="/impact">
              Our impact
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn btn-outline px-5 py-2">
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary hidden px-5 py-2 sm:inline-flex"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="shell grid items-center gap-16 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="animate-rise">
            <span className="chip">
              <span className="h-1.5 w-1.5 animate-simmer rounded-full bg-ember-500" />
              Surplus food, shared same day
            </span>

            <h1 className="mt-7 font-display text-[2.6rem] leading-[1.02] font-semibold sm:text-6xl">
              Good food should never
              <br />
              end in a{" "}
              <span className="relative inline-block">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-2px] bottom-1 h-3 -rotate-1 bg-ember-300/80"
                />
                <span className="relative">bin bag</span>
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-husk-700">
              Every night, kitchens throw away meals that were perfectly good
              hours earlier — while food banks a few streets away turn people
              away empty-handed. Food Bridge is the handshake in between.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup?role=restaurant" className="btn btn-primary">
                Sign up as a restaurant
              </Link>
              <Link href="/signup?role=charity" className="btn btn-accent">
                Sign up as a charity
              </Link>
              <Link href="/impact" className="btn btn-outline">
                See our impact
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-husk-600">
              {PROMISES.map((promise) => (
                <li key={promise} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-basil-600"
                  />
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          {/* Ticket illustration */}
          <div className="relative mx-auto w-full max-w-md">
            <svg
              viewBox="0 0 420 210"
              fill="none"
              aria-hidden="true"
              className="absolute -top-10 left-1/2 h-auto w-[115%] -translate-x-1/2 text-basil-700/60"
            >
              <path
                d="M14 178C78 44 342 44 406 178"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="11 13"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute -top-6 left-0 rounded-2xl border-2 border-husk-950 bg-basil-700 px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-husk-50 uppercase shadow-stamp-sm">
              Kitchen
            </div>
            <div className="absolute -top-6 right-0 rounded-2xl border-2 border-husk-950 bg-ember-400 px-3 py-2 font-mono text-[10px] tracking-[0.16em] text-husk-950 uppercase shadow-stamp-sm">
              Charity
            </div>

            <article className="relative mt-6 animate-drift overflow-hidden rounded-tile border-2 border-husk-950 bg-white shadow-stamp-lg">
              <div className="flex items-center justify-between border-b-2 border-dashed border-husk-950/25 px-6 py-4">
                <span className="eyebrow">Surplus · tonight</span>
                <span className="font-mono text-[11px] text-husk-500">
                  FB-0012
                </span>
              </div>

              <div className="px-6 py-5">
                <h2 className="font-display text-2xl font-semibold">
                  Sourdough &amp; 24 veg boxes
                </h2>
                <p className="mt-1.5 text-sm text-husk-600">
                  Maison Levain · 12 rue des Halles
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="eyebrow">Pickup</dt>
                    <dd className="mt-1 font-medium text-husk-900">
                      17:30 – 19:00
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Distance</dt>
                    <dd className="mt-1 font-medium text-husk-900">1.4 km</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Serves</dt>
                    <dd className="mt-1 font-medium text-husk-900">
                      ≈ 40 meals
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Claimed by</dt>
                    <dd className="mt-1 font-medium text-husk-900">
                      Table Ouverte
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex items-center justify-between gap-3 border-t-2 border-husk-950 bg-husk-100 px-6 py-4">
                <span className="font-mono text-[10px] tracking-[0.16em] text-husk-600 uppercase">
                  Illustration · listings arrive later
                </span>
                <span className="rounded-full border-2 border-basil-800 bg-basil-100 px-3 py-1 text-xs font-semibold text-basil-900">
                  Claimed
                </span>
              </div>
            </article>

            <span
              aria-hidden="true"
              className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-husk-950 bg-canvas"
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-husk-950 bg-canvas"
            />
          </div>
        </section>

        {/* The gap */}
        <section className="border-y-2 border-husk-950/10 bg-husk-100/70">
          <div className="shell grid gap-6 py-14 md:grid-cols-2">
            <div className="card">
              <span className="eyebrow">The waste</span>
              <p className="mt-3 font-display text-2xl leading-snug font-semibold">
                Perfectly good meals are binned at closing time because there is
                nobody left to sell them to.
              </p>
            </div>
            <div className="card">
              <span className="eyebrow">The need</span>
              <p className="mt-3 font-display text-2xl leading-snug font-semibold">
                Across the street, charities plan their menus around whatever
                they can still afford.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="shell py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">Three moves</span>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              A listing, a claim, a shared table.
            </h2>
            <p className="mt-4 leading-relaxed text-husk-700">
              Food Bridge keeps the loop short on purpose: no auctions, no
              couriers, no paperwork. Just the two organisations that already
              have the food and the people who need it.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="card-stamp">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-husk-950 bg-ember-300 font-mono text-sm font-semibold text-husk-950">
                  {item.step}
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-husk-700">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Who it's for + the two CTAs */}
        <section id="who-its-for" className="shell pb-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-tile border-2 border-basil-900 bg-basil-50 p-7 shadow-stamp-lg sm:p-9">
              <span className="chip self-start border-basil-700/30 bg-white text-basil-800">
                Restaurants &amp; hotels
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold">
                Clear the pass, keep the goodwill.
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-husk-800">
                <li className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-700"
                  />
                  Publish what is left instead of guessing at tomorrow&apos;s
                  specials.
                </li>
                <li className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-700"
                  />
                  Only organisations you can see pick your food up.
                </li>
                <li className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-basil-700"
                  />
                  A public profile charities can find in their own city.
                </li>
              </ul>
              <Link
                href="/signup?role=restaurant"
                className="btn btn-primary mt-8 self-start"
              >
                Sign up as a restaurant
              </Link>
            </article>

            <article className="flex flex-col rounded-tile border-2 border-ember-800 bg-ember-50 p-7 shadow-stamp-lg sm:p-9">
              <span className="chip self-start border-ember-600/30 bg-white text-ember-800">
                Charities &amp; food banks
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold">
                Know what is available nearby.
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-husk-800">
                <li className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-600"
                  />
                  Browse surplus published by kitchens around you.
                </li>
                <li className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-600"
                  />
                  Claim the pickups you can genuinely collect and serve.
                </li>
                <li className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-600"
                  />
                  Free, forever — no commission on donated food.
                </li>
              </ul>
              <Link
                href="/signup?role=charity"
                className="btn btn-accent mt-8 self-start"
              >
                Sign up as a charity
              </Link>
            </article>
          </div>
        </section>

        {/* Why it matters */}
        <section id="why" className="shell pb-20">
          <div className="relative overflow-hidden rounded-tile border-2 border-husk-950 bg-basil-950 px-7 py-14 text-husk-50 sm:px-14">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-ember-500/20 blur-2xl"
            />
            <div className="relative max-w-3xl">
              <span className="font-mono text-[11px] tracking-label text-ember-300 uppercase">
                Why it matters
              </span>
              <p className="mt-5 font-display text-3xl leading-snug font-semibold sm:text-4xl">
                Food waste and food poverty are neighbours. Food Bridge is the
                street between them.
              </p>
              <p className="mt-5 leading-relaxed text-husk-200">
                Less food thrown away means less land, water and labour spent on
                meals nobody eats. More surplus reaching charities means more
                people eating today instead of queueing tomorrow.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup?role=restaurant" className="btn btn-accent">
                  Sign up as a restaurant
                </Link>
                <Link
                  href="/login"
                  className="btn border-husk-50/40 bg-transparent text-husk-50 hover:bg-husk-50/10"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-husk-950/10 bg-husk-100/60">
        <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-basil-800">
            <BridgeMark className="h-8 w-8" />
            <div>
              <p className="font-display text-base font-semibold">Food Bridge</p>
              <p className="font-mono text-[10px] tracking-[0.16em] text-husk-600 uppercase">
                Phase 3 · surplus listings &amp; impact
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-husk-700">
            <a className="transition hover:text-basil-800" href="#how-it-works">
              How it works
            </a>
            <a className="transition hover:text-basil-800" href="#who-its-for">
              Who it&apos;s for
            </a>
            <Link className="transition hover:text-basil-800" href="/impact">
              Our impact
            </Link>
            <Link className="transition hover:text-basil-800" href="/login">
              Log in
            </Link>
            <Link className="transition hover:text-basil-800" href="/signup">
              Sign up
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

