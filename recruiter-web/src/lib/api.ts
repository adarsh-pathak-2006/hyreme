import type {
  AppBootstrapResponse,
  AuthResponse,
  Candidate,
  CandidateBootstrapResponse,
  ChatMessage,
  MessageThread,
  OtpRequestResponse,
  ScheduledMeeting,
} from "@hyreme/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
export const OTP_ENABLED = process.env.NEXT_PUBLIC_ENABLE_OTP === "true";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getApiOrigin() {
  return new URL(API_BASE_URL).origin;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error(
      "Unable to reach the API. Make sure the recruiter API server is running and NEXT_PUBLIC_API_BASE_URL is correct.",
    );
  }

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, init, false);
    }
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthResponse;
    return data;
  } catch {
    return null;
  }
}

export async function loginRecruiter(email: string, password: string, rememberMe = false) {
  const data = await request<AuthResponse>(
    "/auth/recruiter/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    },
    false,
  );
  return data;
}

export async function loginCandidate(email: string, password: string, rememberMe = false) {
  const data = await request<AuthResponse>(
    "/auth/candidate/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    },
    false,
  );
  return data;
}

export async function registerCandidate(payload: {
  name: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  const data = await request<AuthResponse>(
    "/auth/candidate/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false,
  );
  return data;
}

export async function registerRecruiter(payload: {
  name: string;
  email: string;
  password: string;
  companyName: string;
  rememberMe?: boolean;
}) {
  const data = await request<AuthResponse>(
    "/auth/recruiter/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false,
  );
  return data;
}

export function requestOtp(email: string, role: "candidate" | "recruiter", purpose: "login" | "register") {
  return request<OtpRequestResponse>("/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ email, role, purpose }),
  }, false);
}

export function verifyOtp(email: string, role: "candidate" | "recruiter", purpose: "login" | "register", code: string) {
  return request<{ message: string }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, role, purpose, code }),
  }, false);
}

export async function logoutRecruiter() {
  await request<void>(
    "/auth/logout",
    {
      method: "POST",
    },
    false,
  );
}

export function getBootstrap() {
  return request<AppBootstrapResponse>("/recruiter/bootstrap");
}

export function getCurrentSession() {
  return request<{ user: AuthResponse["user"] }>("/auth/me");
}

export function getCandidateBootstrap() {
  return request<CandidateBootstrapResponse>("/candidate/bootstrap");
}

export function toggleSavedCandidate(candidateId: string) {
  return request<{ saved: boolean }>("/recruiter/saved/toggle", {
    method: "POST",
    body: JSON.stringify({ candidateId }),
  });
}

export function createMeeting(meeting: ScheduledMeeting) {
  return request("/recruiter/interviews", {
    method: "POST",
    body: JSON.stringify(meeting),
  });
}

export function saveCandidateProfile(profile: Omit<Candidate, "id" | "userId">) {
  return request<{ profile: Candidate }>("/candidate/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function replyToCandidateThread(threadId: string, body: string) {
  return request(`/candidate/messages/${threadId}`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function sendRecruiterMessage(candidateId: string, body: string) {
  return request<MessageThread>("/recruiter/messages", {
    method: "POST",
    body: JSON.stringify({ candidateId, body }),
  });
}

export function getRecruiterThreadMessages(threadId: string) {
  return request<ChatMessage[]>(`/recruiter/messages/${threadId}`);
}

export function getCandidateThreadMessages(threadId: string) {
  return request<ChatMessage[]>(`/candidate/messages/${threadId}`);
}

export async function uploadAsset(file: File, kind: "resume" | "video") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);
  return request<{ url: string; filename: string; kind: "resume" | "video" }>("/uploads", {
    method: "POST",
    body: formData,
  });
}
