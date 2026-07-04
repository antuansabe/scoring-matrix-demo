"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Subject, SubjectType } from "@/lib/db/types";

const inputClass =
  "block w-full border border-border bg-surface px-3 py-2 font-sans text-base text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all rounded-md";
const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

/**
 * Subject-first creation (Phase 10). On success, lands on the new subject's
 * detail page — whose empty state teaches the next step.
 */
export function NewSubjectForm({ jjPartners }: { jjPartners: Subject[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<SubjectType>("jj_partner");
  const [parentOrgId, setParentOrgId] = useState("");
  const [ashokaInternalId, setAshokaInternalId] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nglBlocked = type === "ngl" && jjPartners.length === 0;
  const canSubmit =
    name.trim().length > 0 && !saving && !nglBlocked && (type !== "ngl" || parentOrgId.length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          parentOrgId: type === "ngl" ? parentOrgId : null,
          ashokaInternalId: ashokaInternalId.trim() || undefined,
          createdBy: createdBy.trim() || undefined,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Could not create the subject.";
        setErrorMsg(msg);
        setSaving(false);
        return;
      }
      const { subject } = data as { subject: Subject };
      router.push(`/subjects/${subject.id}`);
    } catch {
      setErrorMsg("Could not connect to the server.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-surface p-6 sm:p-8 space-y-5">
      <div>
        <label className={labelClass} htmlFor="subject-name">
          Name
        </label>
        <input
          id="subject-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fundación Somos Amigos"
          className={`${inputClass} mt-2`}
        />
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">
          The organization&apos;s or person&apos;s name, as you want it to appear everywhere.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="subject-type">
          Type
        </label>
        <select
          id="subject-type"
          value={type}
          onChange={(e) => setType(e.target.value as SubjectType)}
          className={`${inputClass} mt-2`}
        >
          <option value="jj_partner">JJ Partner — an organization</option>
          <option value="ngl">NGL — a young leader within a partner</option>
        </select>
      </div>

      {type === "ngl" &&
        (jjPartners.length > 0 ? (
          <div>
            <label className={labelClass} htmlFor="parent-org">
              Parent organization
            </label>
            <select
              id="parent-org"
              value={parentOrgId}
              onChange={(e) => setParentOrgId(e.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="">Select the partner organization…</option>
              {jjPartners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">
              An NGL always belongs to a partner organization — pick which one.
            </p>
          </div>
        ) : (
          <p className="border-l-2 border-border pl-4 font-sans text-base leading-relaxed text-muted">
            There are no partner organizations yet — create a JJ Partner first; an NGL always
            belongs to one.
          </p>
        ))}

      <div>
        <label className={labelClass} htmlFor="ashoka-id">
          Ashoka internal ID <span className="normal-case text-muted/70">(optional)</span>
        </label>
        <input
          id="ashoka-id"
          type="text"
          value={ashokaInternalId}
          onChange={(e) => setAshokaInternalId(e.target.value)}
          className={`${inputClass} mt-2`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="created-by">
          Your name
        </label>
        <input
          id="created-by"
          type="text"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          placeholder="Recorded as the subject's creator"
          className={`${inputClass} mt-2`}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Creating…" : "Create subject →"}
      </button>

      {errorMsg && (
        <div
          className="border border-border bg-surface p-4"
          style={{ borderLeftWidth: 3, borderLeftColor: "#E87722" }}
          role="alert"
        >
          <p className="font-sans text-base text-ink">{errorMsg}</p>
        </div>
      )}
    </form>
  );
}
