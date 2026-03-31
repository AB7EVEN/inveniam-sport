"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ChatComposerProps = {
  conversationId: string;
};

export function ChatComposer({ conversationId }: ChatComposerProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!value.trim()) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bodyText: value })
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(result?.error ?? "Message could not be sent.");
        return;
      }

      setValue("");
      router.refresh();
    } catch {
      setError("The message request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <textarea
        onChange={(event) => setValue(event.target.value)}
        placeholder="Write a message to the creator..."
        rows={4}
        value={value}
      />
      <div className="chat-composer-footer">
        <span className="meta-note">AI generated responses with policy checks and limited memory.</span>
        <button className="button button-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}

