// firebase/functions/src/onUserWrite.ts
// THE core of the RBAC system. Whenever a /users/{uid} document is created or
// updated, this resolves the user's effective permissions and writes them onto
// the Firebase Auth custom claims. Security Rules then read those claims.
//
// This is why client-side permission checks are UX-only: the source of truth
// for access is the signed token, set here by trusted server code.
// See PHASE_1_SPEC.md Section 3.

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {
  resolvePermissions,
  type Role,
  type ManagerType,
  type PermissionOverrides,
} from "@maxs/types";

if (!admin.apps.length) admin.initializeApp();

export const onUserWrite = onDocumentWritten("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const after = event.data?.after.data();

  // User deleted: strip claims.
  if (!after) {
    await admin.auth().setCustomUserClaims(uid, null);
    return;
  }

  const role = after.role as Role;
  const managerType = after.managerType as ManagerType | undefined;
  const overrides = after.permissionOverrides as PermissionOverrides | undefined;

  // Deactivated users get no permissions, regardless of role.
  const permissions = after.active
    ? resolvePermissions(role, managerType, overrides)
    : [];

  await admin.auth().setCustomUserClaims(uid, {
    role,
    managerType: managerType ?? null,
    permissions,
  });

  // Touch a field so the client knows to force-refresh its ID token.
  await admin.firestore().doc(`users/${uid}`).set(
    { claimsUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
});
