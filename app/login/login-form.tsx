"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  next,
  notice,
}: {
  next: string;
  notice?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resent, setResent] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    setNeedsConfirmation(false);
    setResent(false);

    const form = new FormData(event.currentTarget);
    const emailValue = String(form.get("email") ?? "").trim();
    setEmail(emailValue);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailValue,
      password: String(form.get("password") ?? ""),
    });

    if (signInError) {
      setStatus("idle");
      setError(signInError.message);
      setNeedsConfirmation(/confirm/i.test(signInError.message));
      return;
    }

    // The middleware resolves the role from `profiles` and redirects:
    // restaurant -> /dashboard/restaurant, charity -> /dashboard/charity.
    router.replace(next);
    router.refresh();
  }

  async function handleResend() {
    setResent(false);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7">
      {notice && (
        <p className="mb-5 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm text-ember-900">
          {notice}
        </p>
      )}

      <div className="grid gap-4">
        <div>
          <label className="field-label" htmlFor="email">
            Email
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
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field-input"
            placeholder="Your password"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border-2 border-ember-600/40 bg-ember-50 px-4 py-3 text-sm text-ember-900"
        >
          <p>{error}</p>
          {needsConfirmation && (
            <button
              type="button"
              onClick={handleResend}
              className="link-underline mt-2 font-medium"
            >
              {resent ? "Email sent again" : "Resend my confirmation email"}
            </button>
          )}
        </div>
      )}

      {resent && (
        <p className="field-hint" role="status">
          A fresh confirmation link is on its way to {email}.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-primary mt-6 w-full"
      >
        {status === "submitting" ? "Logging you in…" : "Log in"}
      </button>
    </form>
  );
}
