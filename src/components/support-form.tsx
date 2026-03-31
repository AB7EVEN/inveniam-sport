"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SupportFormProps = {
  initialCategory?: string;
  initialSubject?: string;
  initialConversationId?: string;
  initialContentItemId?: string;
};

export function SupportForm({
  initialCategory = "QUALITY",
  initialSubject = "",
  initialConversationId,
  initialContentItemId
}: SupportFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category,
          subject,
          message,
          conversationId: initialConversationId,
          contentItemId: initialContentItemId
        })
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "Support request failed.");
        return;
      }

      setMessage("");
      router.refresh();
    } catch {
      setError("Support request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Category</span>
        <select
          className="select-field"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="QUALITY">Message quality</option>
          <option value="CONTENT">Content issue</option>
          <option value="BILLING">Billing</option>
          <option value="SAFETY">Safety</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label className="field">
        <span>Subject</span>
        <input onChange={(event) => setSubject(event.target.value)} required value={subject} />
      </label>
      <label className="field">
        <span>Details</span>
        <textarea
          className="textarea-field"
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={5}
          value={message}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-primary button-wide" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : "Submit support request"}
      </button>
    </form>
  );
}
