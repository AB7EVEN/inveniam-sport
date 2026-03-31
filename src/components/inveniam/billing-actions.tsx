"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BillingActionsProps = {
  subscriptionId: string | null;
};

export function BillingActions({ subscriptionId }: BillingActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState<"portal" | "cancel" | null>(null);

  if (!subscriptionId) {
    return null;
  }

  async function openPortal() {
    setError("");
    setNotice("");
    setPendingAction("portal");

    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST"
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null;

      if (!response.ok || !result?.url) {
        setError(result?.error ?? "Unable to open the Stripe billing portal.");
        return;
      }

      window.location.assign(result.url);
    } catch {
      setError("The billing portal request failed. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  async function scheduleCancel() {
    setError("");
    setNotice("");
    setPendingAction("cancel");

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ subscriptionId })
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "Unable to schedule cancellation.");
        return;
      }

      setNotice("Cancellation is scheduled for the end of the current paid term.");
      router.refresh();
    } catch {
      setError("The cancellation request failed. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="stack-sm">
      <div className="button-row">
        <button
          className="button button-primary"
          disabled={pendingAction !== null}
          onClick={openPortal}
          type="button"
        >
          {pendingAction === "portal" ? "Opening portal..." : "Manage in Stripe"}
        </button>
        <button
          className="button button-secondary"
          disabled={pendingAction !== null}
          onClick={scheduleCancel}
          type="button"
        >
          {pendingAction === "cancel" ? "Scheduling..." : "Cancel at period end"}
        </button>
      </div>
      {notice ? <p className="meta-note">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
