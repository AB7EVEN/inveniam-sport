"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ActionButtonProps = {
  endpoint: string;
  method?: "POST" | "PATCH";
  payload?: Record<string, unknown>;
  label: string;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  refreshOnSuccess?: boolean;
  redirectTo?: string;
};

export function ActionButton({
  endpoint,
  method = "POST",
  payload,
  label,
  pendingLabel,
  className,
  disabled,
  refreshOnSuccess = true,
  redirectTo
}: ActionButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: payload ? JSON.stringify(payload) : undefined
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "That action could not be completed.");
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
      }

      if (refreshOnSuccess) {
        router.refresh();
      }
    } catch {
      setError("The request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="action-stack">
      <button
        className={className ?? "button button-primary"}
        disabled={disabled || isSubmitting}
        onClick={handleClick}
        type="button"
      >
        {isSubmitting ? pendingLabel ?? "Working..." : label}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}

