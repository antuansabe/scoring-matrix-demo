/**
 * Demo-mode constants and helpers (Phase 9). The demo subjects are seeded by
 * scripts/seed-demo.ts with these fixed IDs and flagged in the DB with
 * ashoka_internal_id = 'DEMO'. Pure constants — safe to import anywhere.
 */
import type { Subject } from "@/lib/db/types";

export const DEMO_FLAG = "DEMO";

/** Fixed IDs so the walkthrough can link to the demo story deterministically. */
export const DEMO_ORG_ID = "de300000-0000-4000-a000-000000000001";
export const DEMO_NGL_ID = "de300000-0000-4000-a000-000000000002";

export function isDemoSubject(subject: Pick<Subject, "ashoka_internal_id">): boolean {
  return subject.ashoka_internal_id === DEMO_FLAG;
}
