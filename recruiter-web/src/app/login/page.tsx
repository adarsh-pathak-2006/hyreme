"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/recruiter-provider";
import { OTP_ENABLED, requestOtp, verifyOtp } from "@/lib/api";

const AUTH_PREFERENCES_KEY = "hyreme-auth-preferences";

type AuthPreferences = {
  role: "candidate" | "recruiter";
  email: string;
  rememberMe: boolean;
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAppState();
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [email, setEmail] = useState("ritika@hyreme.io");
  const [password, setPassword] = useState("Hyreme@123");
  const [rememberMe, setRememberMe] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [otpStatus, setOtpStatus] = useState<"idle" | "sent" | "verified">("idle");
  const [otpFeedback, setOtpFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const candidateOtpReady = useMemo(
    () => role !== "candidate" || !OTP_ENABLED || otpStatus === "verified",
    [otpStatus, role],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const raw = window.localStorage.getItem(AUTH_PREFERENCES_KEY);
      if (!raw) {
        return;
      }

      try {
        const saved = JSON.parse(raw) as AuthPreferences;
        setRole(saved.role);
        setEmail(saved.email);
        setRememberMe(Boolean(saved.rememberMe));
        setPassword(saved.role === "recruiter" && !saved.email ? "Hyreme@123" : "");
      } catch {
        window.localStorage.removeItem(AUTH_PREFERENCES_KEY);
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const nextRole = searchParams.get("role");
    if (nextRole === "candidate" || nextRole === "recruiter") {
      const timeoutId = window.setTimeout(() => {
        setRole(nextRole);
        setEmail((current) =>
          nextRole === "recruiter" && !current ? "ritika@hyreme.io" : nextRole === "candidate" ? current : current,
        );
        setPassword((current) =>
          nextRole === "recruiter" && !current ? "Hyreme@123" : nextRole === "candidate" ? "" : current,
        );
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [searchParams]);

  function resetOtpState() {
    setOtpCode("");
    setOtpPreview(null);
    setOtpStatus("idle");
    setOtpFeedback(null);
  }

  function persistPreferences(nextRole: "candidate" | "recruiter", nextEmail: string, nextRememberMe: boolean) {
    if (!nextRememberMe) {
      window.localStorage.removeItem(AUTH_PREFERENCES_KEY);
      return;
    }

    window.localStorage.setItem(
      AUTH_PREFERENCES_KEY,
      JSON.stringify({
        role: nextRole,
        email: nextEmail,
        rememberMe: true,
      } satisfies AuthPreferences),
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(218,191,255,0.42),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(144,122,214,0.16),_transparent_24%),linear-gradient(180deg,_#f8f5ff_0%,_#eef0ff_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
        <section className="rounded-[2rem] bg-[linear-gradient(160deg,var(--accent-deep),var(--accent-strong))] p-6 text-stone-50 shadow-[0_24px_100px_rgba(44,42,74,0.28)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent-soft)]">
            Unified access
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            One login hub for candidates and recruiters.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[color:rgba(255,255,255,0.76)]">
            Candidates can build profiles and manage recruiter conversations.
            Recruiters can browse feed, save talent, message, and schedule
            interviews.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-soft)]">
                Candidate demo
              </p>
              <p className="mt-2 text-sm text-[color:rgba(255,255,255,0.8)]">
                Register a new candidate account, then complete your profile.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-soft)]">
                Recruiter demo
              </p>
              <p className="mt-2 text-sm text-[color:rgba(255,255,255,0.8)]">
                Use `ritika@hyreme.io` / `Hyreme@123` after seeding the backend.
              </p>
            </div>
          </div>
        </section>

        <section className="hyreme-glass rounded-[2rem] p-6 sm:p-8">
          <div className="flex gap-3 rounded-full bg-[var(--accent-soft)]/26 p-1">
            {(["candidate", "recruiter"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRole(item);
                  setEmail(item === "recruiter" ? "ritika@hyreme.io" : "");
                  setPassword(item === "recruiter" ? "Hyreme@123" : "");
                  resetOtpState();
                  setError(null);
                }}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                  role === item
                    ? "bg-[linear-gradient(135deg,var(--accent-strong),var(--accent))] text-white"
                    : "text-[color:rgba(44,42,74,0.62)] hover:text-[var(--accent-deep)]"
                }`}
              >
                {item === "candidate" ? "Candidate login" : "Recruiter login"}
              </button>
            ))}
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              if (role === "candidate" && OTP_ENABLED && otpStatus !== "verified") {
                setError("Request and verify your OTP before signing in.");
                return;
              }
              setIsSubmitting(true);
              try {
                await login(role, email, password, rememberMe);
                persistPreferences(role, email, rememberMe);
                resetOtpState();
                router.push(role === "candidate" ? "/candidate" : "/recruiter");
              } catch (loginError) {
                setError(loginError instanceof Error ? loginError.message : "Login failed");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (role === "candidate" && OTP_ENABLED) {
                    resetOtpState();
                  }
                }}
                className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white/80 px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white/80 px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-[color:rgba(79,81,140,0.12)] bg-white/70 px-4 py-3 text-sm text-[var(--accent-deep)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[var(--accent-strong)]"
              />
              <span>Remember me on this device</span>
            </label>

            {role === "candidate" && OTP_ENABLED ? (
              <div className="rounded-[1.5rem] border border-[var(--accent-soft)]/70 bg-[var(--accent-soft)]/16 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium text-[var(--accent-deep)]">One-time passcode</span>
                    <input
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value)}
                      placeholder="Enter the 6-digit OTP"
                      className="w-full rounded-2xl border border-[color:rgba(79,81,140,0.16)] bg-white px-4 py-3 text-sm text-[var(--accent-deep)] outline-none transition"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isSendingOtp || !email}
                    onClick={async () => {
                      setError(null);
                      setOtpFeedback(null);
                      setIsSendingOtp(true);
                      try {
                        const response = await requestOtp(email, "candidate", "login");
                        setOtpPreview(response.otpCode ?? null);
                        setOtpStatus("sent");
                        setOtpFeedback("OTP sent. Verify it before signing in.");
                      } catch (otpError) {
                        setError(otpError instanceof Error ? otpError.message : "Unable to send OTP");
                      } finally {
                        setIsSendingOtp(false);
                      }
                    }}
                    className="hyreme-primary-button rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-[color:rgba(44,42,74,0.68)]">
                    {otpPreview ? `Dev OTP: ${otpPreview}` : "Use the OTP sent for this candidate email."}
                  </div>
                  <button
                    type="button"
                    disabled={isVerifyingOtp || otpStatus === "verified" || otpCode.trim().length !== 6}
                    onClick={async () => {
                      setError(null);
                      setOtpFeedback(null);
                      setIsVerifyingOtp(true);
                      try {
                        await verifyOtp(email, "candidate", "login", otpCode.trim());
                        setOtpStatus("verified");
                        setOtpFeedback("OTP verified. You can now continue.");
                      } catch (otpError) {
                        setError(otpError instanceof Error ? otpError.message : "OTP verification failed");
                      } finally {
                        setIsVerifyingOtp(false);
                      }
                    }}
                    className="hyreme-secondary-button rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
                  >
                    {otpStatus === "verified"
                      ? "OTP verified"
                      : isVerifyingOtp
                        ? "Verifying..."
                        : "Verify OTP"}
                  </button>
                </div>

                {otpFeedback ? (
                  <p className="mt-3 text-sm text-[var(--accent-deep)]">{otpFeedback}</p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-[1.25rem] border border-[var(--accent-soft)] bg-[var(--accent-soft)]/22 px-4 py-4 text-sm text-[var(--accent-deep)]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !candidateOtpReady}
              className="hyreme-primary-button w-full rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-70"
            >
              {isSubmitting
                ? "Signing in..."
                : role === "candidate" && OTP_ENABLED && otpStatus !== "verified"
                  ? "Verify OTP to continue"
                  : `Continue as ${role}`}
            </button>
          </form>

          <div className="mt-6 text-sm text-[color:rgba(44,42,74,0.68)]">
            Need a new account?{" "}
            <Link href="/signup" className="font-semibold text-[var(--accent-deep)] underline underline-offset-4">
              Create one here
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--background)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
