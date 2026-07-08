/**
 * Feature flags for surfaces that are hidden but not deleted.
 * Flipping a flag to true restores the route, its nav links (Header/Footer),
 * and any UI that references the surface — no other change needed.
 *
 * Hidden on 2026-07-07 (Antonio): the Density Badge (/badge) and the
 * community Batch Analysis (/batch) are out of the current pilot's scope.
 * Their message-catalog keys (header.batch, header.badge) are kept so
 * re-enabling stays a one-boolean change.
 */
export const FEATURES = {
  batch: false,
  badge: false,
} as const;
