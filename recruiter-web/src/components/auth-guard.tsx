"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/recruiter-provider";

type AuthGuardProps = {
  allowRole: "candidate" | "recruiter";
  children: ReactNode;
};

export function AuthGuard({ allowRole, children }: AuthGuardProps) {
  const router = useRouter();
  const { authStatus, user } = useAppState();

  useEffect(() => {
    if (authStatus === "loading") {
      return;
    }

    if (authStatus === "anonymous") {
      router.replace(`/login?role=${allowRole}`);
      return;
    }

    if (user?.role !== allowRole) {
      router.replace(user?.role === "recruiter" ? "/recruiter" : "/candidate");
    }
  }, [allowRole, authStatus, router, user]);

  if (authStatus === "loading") {
    return (
      <div className="rounded-[1.75rem] border border-white/70 bg-white/92 p-6 text-sm text-stone-600 shadow-sm">
        Checking your session...
      </div>
    );
  }

  if (authStatus !== "authenticated" || user?.role !== allowRole) {
    return null;
  }

  return <>{children}</>;
}
