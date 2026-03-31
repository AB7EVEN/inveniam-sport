"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type OpportunityChoice = {
  id: string;
  title: string;
  orgName: string;
};

type OutreachComposerProps = {
  opportunities: OpportunityChoice[];
  initialOpportunityId?: string;
};

export function OutreachComposer({
  opportunities,
  initialOpportunityId
}: OutreachComposerProps) {
  const router = useRouter();
  const [opportunityId, setOpportunityId] = useState(initialOpportunityId ?? opportunities[0]?.id ?? "");
  const [messageBody, setMessageBody] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    if (!initialOpportunityId || !opportunities.some((item) => item.id === initialOpportunityId)) {
      return;
    }

    setOpportunityId(initialOpportunityId);
  }, [initialOpportunityId, opportunities]);

  const selectedOpportunity = useMemo(
    () => opportunities.find((item) => item.id === opportunityId),
    [opportunities, opportunityId]
  );

  async function handleAssist() {
    if (!opportunityId) {
      setError("Select an opportunity first.");
      return;
    }

    setError("");
    setSuccess("");
    setIsDrafting(true);

    try {
      const response = await fetch("/api/outreach/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ opportunityId, draft: messageBody })
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string; draft?: string }
        | null;

      if (!response.ok || !result?.draft) {
        setError(result?.error ?? "Unable to generate a draft.");
        return;
      }

      setMessageBody(result.draft);
      setSuccess("Structured draft generated.");
    } catch {
      setError("The request failed. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/outreach/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ opportunityId, messageBody })
      });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(result?.error ?? "Unable to submit this request.");
        return;
      }

      setMessageBody("");
      setSuccess("Introduction request submitted into the queue.");
      router.refresh();
    } catch {
      setError("The request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Opportunity</span>
        <select onChange={(event) => setOpportunityId(event.target.value)} value={opportunityId}>
          {opportunities.map((opportunity) => (
            <option key={opportunity.id} value={opportunity.id}>
              {opportunity.title} · {opportunity.orgName}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Introduction note</span>
        <textarea
          onChange={(event) => setMessageBody(event.target.value)}
          placeholder="Keep this professional, specific, and evidence-based."
          required
          value={messageBody}
        />
      </label>
      <div className="button-row">
        <button
          className="button button-secondary"
          disabled={isDrafting || isSubmitting}
          onClick={handleAssist}
          type="button"
        >
          {isDrafting ? "Drafting..." : "Use AI assist"}
        </button>
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit request"}
        </button>
      </div>
      {selectedOpportunity ? (
        <p className="meta-note">Selected: {selectedOpportunity.title} for {selectedOpportunity.orgName}</p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="meta-note">{success}</p> : null}
    </form>
  );
}
