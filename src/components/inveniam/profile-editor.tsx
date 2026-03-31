"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

type ProfileEditorProps = {
  profile: {
    displayName: string | null;
    ageBand: string | null;
    nationality: string | null;
    dominantFoot: string | null;
    primaryPosition: string | null;
    secondaryPositions: string[];
    heightCm: number | null;
    currentStatus: string | null;
    availability: string | null;
    workAuthorization: string | null;
    bio: string | null;
    videoLinks: string[];
    agentRepresentationStatus: string | null;
  };
};

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: profile.displayName ?? "",
    ageBand: profile.ageBand ?? "",
    nationality: profile.nationality ?? "",
    dominantFoot: profile.dominantFoot ?? "",
    primaryPosition: profile.primaryPosition ?? "",
    secondaryPositions: profile.secondaryPositions.join(", "),
    heightCm: profile.heightCm ? String(profile.heightCm) : "",
    currentStatus: profile.currentStatus ?? "",
    availability: profile.availability ?? "",
    workAuthorization: profile.workAuthorization ?? "",
    bio: profile.bio ?? "",
    videoLinks: profile.videoLinks.join("\n"),
    agentRepresentationStatus: profile.agentRepresentationStatus ?? ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedSecondaryPositions = useMemo(
    () =>
      form.secondaryPositions
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [form.secondaryPositions]
  );

  const parsedVideoLinks = useMemo(
    () =>
      form.videoLinks
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
    [form.videoLinks]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/me/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          displayName: form.displayName,
          ageBand: form.ageBand,
          nationality: form.nationality,
          dominantFoot: form.dominantFoot,
          primaryPosition: form.primaryPosition,
          secondaryPositions: parsedSecondaryPositions,
          heightCm: form.heightCm ? Number(form.heightCm) : null,
          currentStatus: form.currentStatus,
          availability: form.availability,
          workAuthorization: form.workAuthorization,
          bio: form.bio,
          videoLinks: parsedVideoLinks,
          agentRepresentationStatus: form.agentRepresentationStatus
        })
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(result?.error ?? "We could not save your profile.");
        return;
      }

      setSuccess("Profile saved.");
      router.refresh();
    } catch {
      setError("The request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="profile-editor" onSubmit={handleSubmit}>
      <div className="detail-grid">
        <label className="field">
          <span>Display name</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            value={form.displayName}
          />
        </label>
        <label className="field">
          <span>Age band</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, ageBand: event.target.value }))}
            placeholder="18-24"
            value={form.ageBand}
          />
        </label>
        <label className="field">
          <span>Nationality</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, nationality: event.target.value }))}
            value={form.nationality}
          />
        </label>
        <label className="field">
          <span>Dominant foot</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, dominantFoot: event.target.value }))}
            value={form.dominantFoot}
          />
        </label>
        <label className="field">
          <span>Primary position</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, primaryPosition: event.target.value }))}
            value={form.primaryPosition}
          />
        </label>
        <label className="field">
          <span>Secondary positions</span>
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, secondaryPositions: event.target.value }))
            }
            placeholder="Right Back, Left Back"
            value={form.secondaryPositions}
          />
        </label>
        <label className="field">
          <span>Height (cm)</span>
          <input
            inputMode="numeric"
            onChange={(event) => setForm((current) => ({ ...current, heightCm: event.target.value }))}
            value={form.heightCm}
          />
        </label>
        <label className="field">
          <span>Current status</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, currentStatus: event.target.value }))}
            value={form.currentStatus}
          />
        </label>
        <label className="field">
          <span>Availability</span>
          <input
            onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))}
            value={form.availability}
          />
        </label>
        <label className="field">
          <span>Work authorization</span>
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, workAuthorization: event.target.value }))
            }
            value={form.workAuthorization}
          />
        </label>
        <label className="field">
          <span>Representation status</span>
          <input
            onChange={(event) =>
              setForm((current) => ({ ...current, agentRepresentationStatus: event.target.value }))
            }
            value={form.agentRepresentationStatus}
          />
        </label>
        <label className="field">
          <span>Video links</span>
          <textarea
            onChange={(event) => setForm((current) => ({ ...current, videoLinks: event.target.value }))}
            placeholder="One URL per line"
            value={form.videoLinks}
          />
        </label>
      </div>
      <label className="field">
        <span>Bio</span>
        <textarea
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          value={form.bio}
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="meta-note">{success}</p> : null}
      <button className="button button-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
