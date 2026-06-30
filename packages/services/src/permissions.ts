// packages/services/src/permissions.ts
// Client-side permission helpers. UX-ONLY: these gate what the UI shows.
// Real enforcement lives in Firestore Security Rules and Cloud Functions.
// See PHASE_1_SPEC.md Section 3.4.
import type { Permission, CustomClaims } from "@maxs/types";

export function claimsHavePermission(
  claims: CustomClaims | null,
  permission: Permission
): boolean {
  if (!claims) return false;
  return claims.permissions.includes(permission);
}

export function claimsHaveAny(
  claims: CustomClaims | null,
  permissions: Permission[]
): boolean {
  if (!claims) return false;
  return permissions.some((p) => claims.permissions.includes(p));
}

export function claimsHaveAll(
  claims: CustomClaims | null,
  permissions: Permission[]
): boolean {
  if (!claims) return false;
  return permissions.every((p) => claims.permissions.includes(p));
}
