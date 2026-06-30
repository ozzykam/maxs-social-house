// apps/dashboard/src/components/PermissionGate.tsx
// Wraps UI that should only render for users holding a given permission.
// REMINDER: This is presentation only. The server enforces access regardless.
"use client";
import type { ReactNode } from "react";
import type { Permission } from "@maxs/types";
import { claimsHaveAny } from "@maxs/services";
import { useAuth } from "@/lib/useAuth";

export function PermissionGate({
  anyOf,
  children,
  fallback = null,
}: {
  anyOf: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { claims, loading } = useAuth();
  if (loading) return null;
  return claimsHaveAny(claims, anyOf) ? <>{children}</> : <>{fallback}</>;
}
