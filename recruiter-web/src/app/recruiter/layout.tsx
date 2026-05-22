import type { ReactNode } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

export default function RecruiterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard allowRole="recruiter">
      <AppShell
        rightRail={
          <>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/92 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
                Next build steps
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:rgba(44,42,74,0.7)]">
                <li>Connect recruiter auth to a real backend session flow.</li>
                <li>Replace mock candidate feed with paginated API results.</li>
                <li>Wire messages and scheduling to real-time services.</li>
              </ul>
              <Link
                href="/recruiter/login"
                className="hyreme-primary-button mt-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold transition"
              >
                Review login flow
              </Link>
            </div>
            <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,var(--accent-deep),var(--accent-strong))] p-5 text-stone-50 shadow-[0_24px_100px_rgba(44,42,74,0.24)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-soft)]">
                Recruiter ops note
              </p>
              <p className="mt-4 text-2xl font-semibold">8 interviews</p>
              <p className="mt-2 text-sm leading-6 text-[color:rgba(255,255,255,0.78)]">
                are within the next three days, so scheduling and reminders are
                the next highest-value backend integrations.
              </p>
            </div>
          </>
        }
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
