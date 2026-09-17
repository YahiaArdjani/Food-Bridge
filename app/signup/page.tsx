import type { Metadata } from "next";
import Link from "next/link";
import { BridgeMark } from "@/components/bridge-mark";
import { SignupFlow, type SignupRole } from "./signup-flow";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join Food Bridge as a restaurant, hotel or charity and start moving surplus food to the people who need it.",
};

/** Reads `?role=restaurant|charity` so the landing CTAs land on the right form. */
function parseRole(value: string | string[] | undefined): SignupRole | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "restaurant" || raw === "charity" ? raw : null;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialRole = parseRole(params.role);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-2 border-husk-950/10 bg-canvas/85 backdrop-blur-md">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-basil-800">
            <BridgeMark className="h-9 w-9" />
            <span className="font-display text-lg font-semibold tracking-headline">
              Food&nbsp;Bridge
            </span>
          </Link>
          <Link href="/login" className="link-underline text-sm font-medium">
            I already have an account
          </Link>
        </div>
      </header>

      <main className="shell grid flex-1 gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-16">
        <aside className="lg:pt-6">
          <span className="eyebrow">Create an account</span>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold sm:text-5xl">
            One bridge, two ends.
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-husk-700">
            Pick the side you are on and we will set your account up
            accordingly — the fields, the dashboard and who can reach you.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <li className="card flex gap-3 py-4">
              <span className="font-mono text-ember-700">01</span>
              <span className="text-husk-700">
                Tell us who you are and we email you a confirmation link.
              </span>
            </li>
            <li className="card flex gap-3 py-4">
              <span className="font-mono text-ember-700">02</span>
              <span className="text-husk-700">
                Confirm the address — accounts stay verified, no throwaway
                signups.
              </span>
            </li>
            <li className="card flex gap-3 py-4">
              <span className="font-mono text-ember-700">03</span>
              <span className="text-husk-700">
                Land on your own dashboard. Listings come in the next phase.
              </span>
            </li>
          </ul>
        </aside>

        <SignupFlow initialRole={initialRole} />
      </main>
    </div>
  );
}
