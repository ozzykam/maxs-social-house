"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@maxs/services";
import type { CustomClaims, UserRecord } from "@maxs/types";

function parseClaims(claims: Record<string, unknown>): CustomClaims {
  return {
    role: claims.role as CustomClaims["role"],
    managerType: claims.managerType as CustomClaims["managerType"],
    permissions: (claims.permissions as CustomClaims["permissions"]) ?? [],
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let prevClaimsUpdatedAt: unknown = undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      unsubscribeDoc?.();
      unsubscribeDoc = null;

      if (u) {
        const token = await u.getIdTokenResult(true);
        setClaims(parseClaims(token.claims));
        setLoading(false);

        prevClaimsUpdatedAt = undefined;
        unsubscribeDoc = onSnapshot(doc(db, "users", u.uid), async (snap) => {
          if (!snap.exists()) return;

          const data = snap.data();
          setUserRecord(data as UserRecord);

          // When onUserWrite updates claims it writes claimsUpdatedAt.
          // Detect that change and force-refresh the ID token so the new
          // permissions take effect without requiring the user to re-login.
          const updatedAt = data.claimsUpdatedAt;
          if (prevClaimsUpdatedAt !== undefined && updatedAt !== prevClaimsUpdatedAt) {
            try {
              const fresh = await u.getIdTokenResult(true);
              setClaims(parseClaims(fresh.claims));
            } catch {
              // Quota or network error — claims will refresh on next sign-in.
            }
          }
          prevClaimsUpdatedAt = updatedAt;
        });
      } else {
        setClaims(null);
        setUserRecord(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDoc?.();
    };
  }, []);

  return { user, claims, userRecord, loading };
}
