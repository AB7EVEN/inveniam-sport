"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
};

function getSafeNextPath(nextPath: string | null, fallback: string) {
  if (!nextPath) {
    return fallback;
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  return nextPath;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const submitLabel = mode === "login" ? "Log in" : "Create account";
  const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
  const defaultRedirect = mode === "login" ? "/dashboard" : "/dashboard";
  const nextPath = useMemo(
    () => getSafeNextPath(searchParams.get("next"), defaultRedirect),
    [defaultRedirect, searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "We could not complete that request.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("The request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
          type="password"
          value={password}
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button button-primary button-wide" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Working..." : submitLabel}
      </button>
    </form>
  );
}
