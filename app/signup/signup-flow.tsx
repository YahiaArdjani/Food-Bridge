"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type SignupRole = "restaurant" | "charity";

type RoleConfig = {
  label: string;
  blurb: string;
  orgLabel: string;
  orgPlaceholder: string;
  fullNameLabel: string;
  phoneLabel: string;
  addressLabel: string;
  addressPlaceholder: string;
  cityPlaceholder: string;
};

const ROLE_COPY: Record<SignupRole, RoleConfig> = {
  restaurant: {
    label: "Restaurant / hotel",
    blurb:
      "You cook more than you sell and would rather hand the surplus to a neighbour than bin it.",
    orgLabel: "Restaurant or hotel name",
    orgPlaceholder: "Maison Levain",
    fullNameLabel: "Contact person",
    phoneLabel: "Phone (for pickup coordination)",
    addressLabel: "Kitchen / pickup address",
    addressPlaceholder: "12 rue des Halles",
    cityPlaceholder: "Lyon",
  },
  charity: {
    label: "Charity",
    blurb:
      "You feed people and want to know what surplus is available nearby today.",
    orgLabel: "Charity name",
    orgPlaceholder: "Table Ouverte",
    fullNameLabel: "Contact person",
    phoneLabel: "Phone",
    addressLabel: "Address of your centre",
    addressPlaceholder: "8 quai Saint-Vincent",
    cityPlaceholder: "Lyon",
  },
};

const ROLE_ORDER: SignupRole[] = ["restaurant", "charity"];

export function SignupFlow({ initialRole }: { initialRole: SignupRole | null }) {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole | null>(initialRole);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);

  function redirectTo() {
    return `${window.location.origin}/auth/callback?next=/dashboard`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) return;

    setStatus("submitting");
    setError(null);

    const form = new FormData(event.currentTarget);
    const emailValue = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (password.length < 8) {
      setStatus("idle");
      setError("Choose a password of at least 8 characters.");
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailValue,
      password,
      options: {
        emailRedirectTo: redirectTo(),
        data: {
          role,
          full_name: String(form.get("full_name") ?? "").trim(),
          organization_name: String(form.get("organization_name") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
          address: String(form.get("address") ?? "").trim(),
          city: String(form.get("city") ?? "").trim(),
        },
      },
    });

    if (signUpError) {
      setStatus("idle");
      setError(signUpError.message);
      return;
    }

    setEmail(emailValue);

    // A session here means the project has email confirmation disabled.
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setStatus("sent");
  }

  async function handleResend() {
    setResent(false);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo() },
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResent(true);
  }

  if (status === "sent") {
    return (
      <section className="card-stamp self-start">
        <span className="eyebrow">Almost there</span>
        <h2 className="mt-3 font-display text-3xl font-semibold">
          Confirm your email
        </h2>
        <p className="mt-4 leading-relaxed text-husk-700">
          We sent a confirmation link to{" "}
          <strong className="font-semibold text-husk-950">{email}</strong>. Open
          it and your account becomes active — then log in and you land on your
          own dashboard.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/login" className="btn btn-primary">
            Go to log in
          </Link>
          <button
            type="button"
            onClick={handleResend}
            className="btn btn-outline"
          >
            {resent ? "Email sent again" : "Resend the email"}
          </button>
        </div>

        {resent && (
          <p className="field-hint" role="status">
            A fresh confirmation link is on its way — it can take a minute to
            arrive.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm text-ember-900"
          >
            {error}
          </p>
        )}

        <p className="mt-8 border-t-2 border-dashed border-husk-950/20 pt-5 text-sm text-husk-600">
          Wrong address?{" "}
          <button
            type="button"
            className="link-underline font-medium"
            onClick={() => {
              setStatus("idle");
              setError(null);
              setResent(false);
            }}
          >
            Start over
          </button>
        </p>
      </section>
    );
  }

  const activeConfig = role ? ROLE_COPY[role] : null;

  return (
    <section className="card-stamp self-start">
      <span className="eyebrow">Step 1</span>
      <h2 className="mt-3 font-display text-3xl leading-tight font-semibold">
        Are you a restaurant/hotel or a charity?
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-husk-600">
        This decides which dashboard you get and which end of the bridge you
        appear on.
      </p>

      <div
        role="radiogroup"
        aria-label="Are you a restaurant/hotel or a charity?"
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        {ROLE_ORDER.map((key) => {
          const config = ROLE_COPY[key];
          const active = role === key;

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setRole(key);
                setError(null);
              }}
              className={`rounded-stamp border-2 p-5 text-left transition ${
                active
                  ? "border-husk-950 bg-basil-100 shadow-stamp"
                  : "border-husk-950/15 bg-white hover:-translate-y-0.5 hover:border-husk-950/40 hover:shadow-stamp-sm"
              }`}
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 ${
                  key === "restaurant"
                    ? "border-basil-900 bg-basil-700 text-husk-50"
                    : "border-ember-800 bg-ember-400 text-husk-950"
                }`}
              >
                {key === "restaurant" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M7 3v6.5a2.5 2.5 0 0 0 5 0V3M9.5 12v9M16.5 3c1.5 1.2 2 3 2 5s-.6 3.2-2 4v9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span className="mt-4 block font-display text-lg font-semibold">
                {config.label}
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-husk-600">
                {config.blurb}
              </span>
              <span
                className={`mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase ${
                  active ? "text-basil-800" : "text-husk-500"
                }`}
              >
                {active ? "Selected" : "Choose this"}
              </span>
            </button>
          );
        })}
      </div>

      {role && activeConfig ? (
        <form
          onSubmit={handleSubmit}
          className="mt-8 border-t-2 border-dashed border-husk-950/20 pt-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow">Step 2 · your details</span>
            <button
              type="button"
              onClick={() => {
                setRole(null);
                setError(null);
              }}
              className="link-underline text-sm font-medium"
            >
              Change role
            </button>
          </div>

          <p className="mt-4 inline-flex rounded-full border-2 border-husk-950/15 bg-white px-3 py-1 text-xs font-semibold text-husk-800">
            Signing up as {activeConfig.label}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="organization_name">
                {activeConfig.orgLabel}
              </label>
              <input
                id="organization_name"
                name="organization_name"
                required
                autoComplete="organization"
                className="field-input"
                placeholder={activeConfig.orgPlaceholder}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="full_name">
                {activeConfig.fullNameLabel}
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                autoComplete="name"
                className="field-input"
                placeholder="Camille Fabre"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="phone">
                {activeConfig.phoneLabel}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="field-input"
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="address">
                {activeConfig.addressLabel}
              </label>
              <input
                id="address"
                name="address"
                autoComplete="street-address"
                className="field-input"
                placeholder={activeConfig.addressPlaceholder}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="city">
                City
              </label>
              <input
                id="city"
                name="city"
                autoComplete="address-level2"
                className="field-input"
                placeholder={activeConfig.cityPlaceholder}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field-input"
                placeholder="contact@maisonlevain.fr"
              />
              <p className="field-hint">
                The confirmation link is sent here — you will need it before you
                can log in.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="field-input"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm text-ember-900"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn btn-primary mt-6 w-full"
          >
            {status === "submitting"
              ? "Creating your account…"
              : `Create ${activeConfig.label.toLowerCase()} account`}
          </button>

          <p className="field-hint">
            Surplus food is always handed over free of charge. Only verified
            organisations appear in the directory.
          </p>
        </form>
      ) : (
        <p className="mt-7 rounded-2xl border-2 border-dashed border-husk-950/20 px-4 py-3 text-sm text-husk-600">
          Pick one of the two cards above to reveal the matching form.
        </p>
      )}
    </section>
  );
}
