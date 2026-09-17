import type { Metadata } from "next";
import Link from "next/link";
import { BridgeMark } from "@/components/bridge-mark";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Food Bridge restaurant or charity account.",
};

const NOTICES: Record<string, string> = {
  callback:
    "That confirmation link could not be verified — it may have expired. Try logging in, or request a fresh email below.",
  session: "Your session ended. Log in again to reach your dashboard.",
};

/** Only allow same-site redirects. */
function safeNext(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const notice = errorCode ? (NOTICES[errorCode] ?? NOTICES.callback) : undefined;

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
          <Link href="/signup" className="link-underline text-sm font-medium">
            Create an account
          </Link>
        </div>
      </header>

      <main className="shell grid flex-1 items-start gap-12 py-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16 lg:py-20">
        <section className="card-stamp w-full max-w-xl self-start">
          <span className="eyebrow">Welcome back</span>
          <h1 className="mt-3 font-display text-4xl leading-tight font-semibold">
            Log in to Food Bridge
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-husk-600">
            We take you straight to the right place: restaurants and hotels land
            on their kitchen dashboard, charities on theirs.
          </p>

          <LoginForm next={next} notice={notice} />

          <p className="mt-8 border-t-2 border-dashed border-husk-950/20 pt-5 text-sm text-husk-600">
            No account yet?{" "}
            <Link href="/signup" className="link-underline font-medium">
              Sign up as a restaurant or a charity
            </Link>
            .
          </p>
        </section>

        <aside className="hidden lg:block">
          <div className="rounded-tile border-2 border-basil-900 bg-basil-950 p-8 text-husk-50 shadow-stamp-lg">
            <span className="font-mono text-[11px] tracking-label text-ember-300 uppercase">
              Two ends, one bridge
            </span>
            <p className="mt-5 font-display text-2xl leading-snug font-semibold">
              Kitchens with too much, kitchens with too little — the same city,
              the same evening.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-husk-200">
              <li>Restaurants: publish what will not be sold.</li>
              <li>Charities: claim what you can collect and serve.</li>
              <li>Nobody pays for donated food. Ever.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
