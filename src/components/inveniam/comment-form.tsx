"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ body })
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(result?.error ?? "Unable to post comment.");
        return;
      }

      setBody("");
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
        <span>Add comment</span>
        <textarea onChange={(event) => setBody(event.target.value)} required value={body} />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-secondary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
