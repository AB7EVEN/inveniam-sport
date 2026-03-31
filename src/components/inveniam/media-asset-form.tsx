"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function MediaAssetForm() {
  const router = useRouter();
  const [assetType, setAssetType] = useState<"VIDEO_LINK" | "PDF_CV" | "IMAGE" | "METRICS_FILE">("VIDEO_LINK");
  const [label, setLabel] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [storagePath, setStoragePath] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/me/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assetType,
          label,
          externalUrl: externalUrl || undefined,
          storagePath: storagePath || undefined
        })
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(result?.error ?? "Unable to add media asset.");
        return;
      }

      setLabel("");
      setExternalUrl("");
      setStoragePath("");
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
        <span>Asset type</span>
        <select onChange={(event) => setAssetType(event.target.value as typeof assetType)} value={assetType}>
          <option value="VIDEO_LINK">Video link</option>
          <option value="PDF_CV">PDF CV</option>
          <option value="IMAGE">Image</option>
          <option value="METRICS_FILE">Metrics file</option>
        </select>
      </label>
      <label className="field">
        <span>Label</span>
        <input onChange={(event) => setLabel(event.target.value)} value={label} />
      </label>
      <label className="field">
        <span>External URL</span>
        <input onChange={(event) => setExternalUrl(event.target.value)} value={externalUrl} />
      </label>
      <label className="field">
        <span>Storage path</span>
        <input onChange={(event) => setStoragePath(event.target.value)} value={storagePath} />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button-secondary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Adding..." : "Add asset"}
      </button>
    </form>
  );
}
