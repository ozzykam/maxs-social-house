import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {
  resolvePermissions,
  type Role,
  type ManagerType,
  type PermissionOverrides,
} from "@maxs/types";

export const onUserWrite = onDocumentWritten("users/{uid}", async (event) => {
  if (!admin.apps.length) admin.initializeApp();

  const uid = event.params.uid;
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  // User deleted: strip claims.
  if (!after) {
    await admin.auth().setCustomUserClaims(uid, null);
    return;
  }

  // Skip if only claimsUpdatedAt changed — that's our own write coming back
  // as a new event. Without this guard the function loops forever.
  if (before) {
    const claimsRelevant = (d: Record<string, unknown>) => ({
      role: d.role,
      managerType: d.managerType,
      active: d.active,
      permissionOverrides: JSON.stringify(d.permissionOverrides ?? null),
    });
    if (JSON.stringify(claimsRelevant(before)) === JSON.stringify(claimsRelevant(after))) return;
  }

  const role = after.role as Role;
  const managerType = after.managerType as ManagerType | undefined;
  const overrides = after.permissionOverrides as PermissionOverrides | undefined;

  const permissions = after.active
    ? resolvePermissions(role, managerType, overrides)
    : [];

  await admin.auth().setCustomUserClaims(uid, {
    role,
    managerType: managerType ?? null,
    permissions,
  });

  await admin.firestore().doc(`users/${uid}`).set(
    { claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
});
