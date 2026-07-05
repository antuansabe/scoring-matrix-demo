"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Subject, SubjectType } from "@/lib/db/types";

const inputClass =
  "block w-full border border-border bg-surface px-3 py-2 font-sans text-base text-ink placeholder:text-muted focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all rounded-md";
const labelClass = "font-mono text-xs uppercase tracking-widest text-muted";

/**
 * Subject-first creation (Phase 10). On success, lands on the new subject's
 * detail page — whose empty state teaches the next step.
 */
export function NewSubjectForm({ jjPartners }: { jjPartners: Subject[] }) {
  const t = useTranslations("newSubject");
  const ts = useTranslations("subjectTypes");
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
            : t("errorFallback");
        setErrorMsg(msg);
        setSaving(false);
        return;
      }
      const { subject } = data as { subject: Subject };
      router.push(`/subjects/${subject.id}`);
    } catch {
      setErrorMsg(t("errorConnect"));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-surface p-6 sm:p-8 space-y-5">
      <div>
        <label className={labelClass} htmlFor="subject-name">
          {t("name")}
        </label>
        <input
          id="subject-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          className={`${inputClass} mt-2`}
        />
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">
          {t("nameHelp")}
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="subject-type">
          {t("type")}
        </label>
        <select
          id="subject-type"
          value={type}
          onChange={(e) => setType(e.target.value as SubjectType)}
          className={`${inputClass} mt-2`}
        >
          <option value="jj_partner">{ts("jjOption")}</option>
          <option value="ngl">{ts("nglOption")}</option>
        </select>
      </div>

      {type === "ngl" &&
        (jjPartners.length > 0 ? (
          <div>
            <label className={labelClass} htmlFor="parent-org">
              {t("parentOrg")}
            </label>
            <select
              id="parent-org"
              value={parentOrgId}
              onChange={(e) => setParentOrgId(e.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="">{t("selectParent")}</option>
              {jjPartners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 font-sans text-sm leading-relaxed text-muted">
              {t("parentHelp")}
            </p>
          </div>
        ) : (
          <p className="border-l-2 border-border pl-4 font-sans text-base leading-relaxed text-muted">
            {t("noParents")}
          </p>
        ))}

      <div>
        <label className={labelClass} htmlFor="ashoka-id">
          {t("ashokaId")} <span className="normal-case text-muted/70">{t("optional")}</span>
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
          {t("createdBy")}
        </label>
        <input
          id="created-by"
          type="text"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          placeholder={t("createdByPlaceholder")}
          className={`${inputClass} mt-2`}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="min-h-11 rounded-md bg-accent-cta px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? t("creating") : t("create")}
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
