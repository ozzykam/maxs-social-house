"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/useAuth";

const PUBLIC_PATHS = ["/login"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.push("/login");
    if (user && isPublic) router.push("/");
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  // Prevent flash of protected content while redirect is in flight
  if (!user && !isPublic) return null;
  if (user && isPublic) return null;

  return <>{children}</>;
}
