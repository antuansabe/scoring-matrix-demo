import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { createSubject } from "@/lib/db/subjects";
import { DEMO_FLAG } from "@/lib/demo";
import type { SubjectType } from "@/lib/db/types";

export const runtime = "nodejs";

const VALID_SUBJECT_TYPES: SubjectType[] = ["jj_partner", "ngl"];

function describeError(err: unknown): { message: string; code?: string } {
  if (err && typeof err === "object") {
    const e = err as { message?: string; code?: string };
    return { message: e.message ?? String(err), code: e.code };
  }
  return { message: String(err) };
}

export async function POST(request: Request): Promise<Response> {
  // Error messages follow the caller's locale (cw.locale cookie).
  const t = await getTranslations("apiErrors");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("common.badJson") }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: t("common.notObject") }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: t("subjects.nameRequired") }, { status: 400 });
  }
  if (!VALID_SUBJECT_TYPES.includes(b.type as SubjectType)) {
    return NextResponse.json({ error: t("subjects.badType") }, { status: 400 });
  }
  const type = b.type as SubjectType;
  const parentOrgId = typeof b.parentOrgId === "string" && b.parentOrgId ? b.parentOrgId : null;
  if (type === "ngl" && !parentOrgId) {
    return NextResponse.json(
      { error: t("subjects.nglNeedsParent") },
      { status: 400 },
    );
  }
  const ashokaInternalId =
    typeof b.ashokaInternalId === "string" && b.ashokaInternalId.trim()
      ? b.ashokaInternalId.trim()
      : null;
  // The DEMO flag is reserved for the seeded fictional example — a real
  // subject must never be able to masquerade as (or hide like) demo data.
  if (ashokaInternalId === DEMO_FLAG) {
    return NextResponse.json(
      { error: t("subjects.demoReserved", { flag: DEMO_FLAG }) },
      { status: 400 },
    );
  }
  const createdBy = typeof b.createdBy === "string" && b.createdBy.trim() ? b.createdBy.trim() : null;

  try {
    const subject = await createSubject({
      name,
      type,
      parent_org_id: parentOrgId,
      ashoka_internal_id: ashokaInternalId,
      created_by: createdBy,
    });
    return NextResponse.json({ subject }, { status: 201 });
  } catch (err: unknown) {
    const { message, code } = describeError(err);
    if (code === "23514") {
      return NextResponse.json({ error: t("subjects.dbRejected", { message }) }, { status: 400 });
    }
    console.error("[api/subjects] Failed to create subject:", err);
    return NextResponse.json({ error: t("subjects.createFailed") }, { status: 500 });
  }
}
