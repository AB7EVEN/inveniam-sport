"use client";

import { useState } from "react";

type InsightActionsProps = {
  primaryOpportunityId?: string;
};

type InsightResult = {
  summary?: string;
  checklist?: string[];
  fitBuckets?: Array<{ title: string; reason: string; matchScore: number }>;
  confidence?: number;
};

export function InsightActions({ primaryOpportunityId }: InsightActionsProps) {
  const [loading, setLoading] = useState<"coach" | "fit" | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InsightResult | null>(null);

  async function run(endpoint: string, nextLoading: "coach" | "fit", body?: Record<string, unknown>) {
    setLoading(nextLoading);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
      });
      const payload = (await response.json().catch(() => null)) as (InsightResult & { error?: string }) | null;
      if (!response.ok) {
        setError(payload?.error ?? "Unable to generate insight.");
        return;
      }
      setResult(payload);
    } catch {
      setError("The request failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="stack-list">
      <div className="button-row">
        <button
          className="button button-secondary"
          disabled={loading !== null}
          onClick={() => run("/api/insights/profile-coach", "coach")}
          type="button"
        >
          {loading === "coach" ? "Running..." : "Run profile coach"}
        </button>
        <button
          className="button button-secondary"
          disabled={loading !== null}
          onClick={() => run("/api/insights/club-fit", "fit")}
          type="button"
        >
          {loading === "fit" ? "Running..." : "Run club fit"}
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {result ? (
        <div className="list-card">
          {result.summary ? <p>{result.summary}</p> : null}
          {result.checklist?.length ? (
            <ul className="feature-list">
              {result.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {result.fitBuckets?.length ? (
            <div className="stack-list">
              {result.fitBuckets.map((bucket) => (
                <div className="list-card" key={bucket.title}>
                  <strong>{bucket.title}</strong>
                  <p>{bucket.reason}</p>
                  <p className="meta-note">Match score: {bucket.matchScore}</p>
                </div>
              ))}
            </div>
          ) : null}
          {typeof result.confidence === "number" ? (
            <p className="meta-note">Confidence: {Math.round(result.confidence * 100)}%</p>
          ) : null}
          {primaryOpportunityId ? (
            <p className="meta-note">Tip: pair this with AI message assist from the outreach composer.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
