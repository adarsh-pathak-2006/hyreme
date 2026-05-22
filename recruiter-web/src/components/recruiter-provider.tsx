"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import type {
  AuthUser,
  Candidate,
  ChatMessage,
  InterviewItem,
  MessageThread,
  NotificationItem,
  PipelineItem,
  RecruiterMetric,
  ScheduledMeeting,
} from "@/lib/types";
import {
  createMeeting,
  getApiOrigin,
  getBootstrap,
  getCandidateThreadMessages,
  getCandidateBootstrap,
  getCurrentSession,
  getRecruiterThreadMessages,
  loginCandidate,
  loginRecruiter,
  logoutRecruiter,
  sendRecruiterMessage,
  registerCandidate,
  registerRecruiter,
  replyToCandidateThread,
  saveCandidateProfile,
  toggleSavedCandidate as toggleSavedCandidateRequest,
} from "@/lib/api";
import {
  candidateHighlights,
  interviewSchedule,
  messageThreads,
  recruiterMetrics,
  recruiterPipeline,
} from "@/lib/mock-data";

type AuthStatus = "loading" | "anonymous" | "authenticated";
type AuthRole = "candidate" | "recruiter";

type CandidateProfileInput = Omit<Candidate, "id" | "userId">;

type AppState = {
  authStatus: AuthStatus;
  user: AuthUser | null;
  candidates: Candidate[];
  savedCandidateIds: string[];
  savedCandidates: Candidate[];
  meetings: Record<string, ScheduledMeeting | undefined>;
  metrics: RecruiterMetric[];
  pipeline: PipelineItem[];
  threads: MessageThread[];
  threadMessages: Record<string, ChatMessage[]>;
  interviews: InterviewItem[];
  notifications: NotificationItem[];
  candidateProfile: Candidate | null;
  candidateMetrics: RecruiterMetric[];
  login: (role: AuthRole, email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    role: AuthRole,
    payload: { name: string; email: string; password: string; companyName?: string; rememberMe?: boolean },
  ) => Promise<void>;
  logout: () => Promise<void>;
  toggleSavedCandidate: (candidateId: string) => Promise<void>;
  isCandidateSaved: (candidateId: string) => boolean;
  scheduleMeeting: (meeting: ScheduledMeeting) => Promise<void>;
  saveProfile: (profile: CandidateProfileInput) => Promise<void>;
  replyToThread: (threadId: string, body: string) => Promise<void>;
  sendMessageToCandidate: (candidateId: string, body: string) => Promise<string | undefined>;
  loadThreadMessages: (threadId: string) => Promise<ChatMessage[]>;
  refreshData: () => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "hyreme-recruiter-saved";
const MEETING_STORAGE_KEY = "hyreme-recruiter-meetings";
const defaultSavedCandidateIds = [
  candidateHighlights[1]?.id ?? "",
  candidateHighlights[3]?.id ?? "",
].filter(Boolean);

function getLocalSavedCandidateIds() {
  if (typeof window === "undefined") {
    return defaultSavedCandidateIds;
  }

  const storedSaved = window.localStorage.getItem(STORAGE_KEY);
  return storedSaved
    ? (JSON.parse(storedSaved) as string[])
    : defaultSavedCandidateIds;
}

function getLocalMeetings() {
  if (typeof window === "undefined") {
    return {};
  }

  const storedMeetings = window.localStorage.getItem(MEETING_STORAGE_KEY);
  return storedMeetings
    ? (JSON.parse(storedMeetings) as Record<string, ScheduledMeeting | undefined>)
    : {};
}

const defaultCandidateMetrics: RecruiterMetric[] = [
  { label: "Recruiter saves", value: "0", change: "Complete your profile to get discovered" },
  { label: "Interviews", value: "0", change: "No meetings scheduled yet" },
  { label: "Messages", value: "0", change: "No recruiter conversations yet" },
  { label: "Profile strength", value: "35%", change: "Add video and resume details" },
];

function mergeChatMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();

  for (const message of [...current, ...incoming]) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function RecruiterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>(candidateHighlights);
  const [savedCandidateIds, setSavedCandidateIds] =
    useState<string[]>(getLocalSavedCandidateIds);
  const [meetings, setMeetings] =
    useState<Record<string, ScheduledMeeting | undefined>>(getLocalMeetings);
  const [metrics, setMetrics] = useState<RecruiterMetric[]>(recruiterMetrics);
  const [pipeline, setPipeline] = useState<PipelineItem[]>(recruiterPipeline);
  const [threads, setThreads] = useState<MessageThread[]>(messageThreads);
  const [threadMessages, setThreadMessages] = useState<Record<string, ChatMessage[]>>({});
  const [interviews, setInterviews] = useState<InterviewItem[]>(interviewSchedule);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [candidateMetrics, setCandidateMetrics] =
    useState<RecruiterMetric[]>(defaultCandidateMetrics);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCandidateIds));
  }, [savedCandidateIds]);

  useEffect(() => {
    window.localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(meetings));
  }, [meetings]);

  const resetToAnonymous = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(MEETING_STORAGE_KEY);
      document.cookie = "hyreme_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
    setAuthStatus("anonymous");
    setUser(null);
    setCandidateProfile(null);
    setCandidateMetrics(defaultCandidateMetrics);
    setCandidates(candidateHighlights);
    setMetrics(recruiterMetrics);
    setPipeline(recruiterPipeline);
    setThreads(messageThreads);
    setThreadMessages({});
    setInterviews(interviewSchedule);
    setNotifications([]);
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const session = await getCurrentSession();
      setUser(session.user);
      setAuthStatus("authenticated");

      if (typeof window !== "undefined") {
        document.cookie = `hyreme_session=${session.user.role}:${session.user.id}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
      }

      if (session.user.role === "recruiter") {
        const bootstrap = await getBootstrap();
        setCandidates(
          bootstrap.feed.candidates.length > 0
            ? bootstrap.feed.candidates
            : candidateHighlights,
        );
        setMetrics(bootstrap.dashboard.metrics);
        setPipeline(bootstrap.dashboard.pipeline);
        setThreads(bootstrap.messages);
        setInterviews(bootstrap.interviews);
        setNotifications(bootstrap.notifications);
        setSavedCandidateIds(bootstrap.saved.candidates.map((candidate) => candidate.id));
        setMeetings(bootstrap.saved.meetings);
        setCandidateProfile(null);
        setCandidateMetrics(defaultCandidateMetrics);
        return;
      }

      const bootstrap = await getCandidateBootstrap();
      setCandidateProfile(bootstrap.profile);
      setCandidateMetrics(bootstrap.dashboard.metrics);
      setThreads(bootstrap.messages);
      setInterviews(bootstrap.interviews);
      setNotifications(bootstrap.notifications);
      setCandidates(
        bootstrap.profile ? [bootstrap.profile] : candidateHighlights,
      );
      setSavedCandidateIds([]);
      setMeetings({});
      setMetrics(recruiterMetrics);
      setPipeline(recruiterPipeline);
    } catch {
      resetToAnonymous();
    }
  }, [resetToAnonymous]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void hydrate();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hydrate]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(getApiOrigin(), {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on(
      "messages:updated",
      (payload: { threadId?: string; message?: ChatMessage }) => {
        if (!payload.threadId || !payload.message) {
          return;
        }

        setThreadMessages((current) => ({
          ...current,
          [payload.threadId!]: mergeChatMessages(
            current[payload.threadId!] ?? [],
            [payload.message!],
          ),
        }));
        void hydrate();
      },
    );

    socket.on("feed:updated", () => {
      if (user.role === "recruiter") {
        void hydrate();
      }
    });

    socket.on("app:refresh", () => {
      void hydrate();
    });

    return () => {
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [authStatus, hydrate, user]);

  const value = useMemo<AppState>(() => {
    const savedCandidates = candidates.filter((candidate) =>
      savedCandidateIds.includes(candidate.id),
    );

    return {
      authStatus,
      user,
      candidates,
      savedCandidateIds,
      savedCandidates,
      meetings,
      metrics,
      pipeline,
      threads,
      threadMessages,
      interviews,
      notifications,
      candidateProfile,
      candidateMetrics,
      login: async (role, email, password, rememberMe = false) => {
        if (role === "recruiter") {
          await loginRecruiter(email, password, rememberMe);
        } else {
          await loginCandidate(email, password, rememberMe);
        }
        await hydrate();
      },
      register: async (role, payload) => {
        if (role === "recruiter") {
          await registerRecruiter({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            companyName: payload.companyName ?? "HYREME",
            rememberMe: payload.rememberMe,
          });
        } else {
          await registerCandidate({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            rememberMe: payload.rememberMe,
          });
        }
        await hydrate();
      },
      logout: async () => {
        await logoutRecruiter().catch(() => undefined);
        resetToAnonymous();
        router.replace("/signup");
      },
      toggleSavedCandidate: async (candidateId: string) => {
        if (user?.role === "recruiter" && authStatus === "authenticated") {
          const result = await toggleSavedCandidateRequest(candidateId);
          setSavedCandidateIds((current) =>
            result.saved
              ? [...new Set([...current, candidateId])]
              : current.filter((id) => id !== candidateId),
          );
          return;
        }

        setSavedCandidateIds((current) =>
          current.includes(candidateId)
            ? current.filter((id) => id !== candidateId)
            : [...current, candidateId],
        );
      },
      isCandidateSaved: (candidateId: string) =>
        savedCandidateIds.includes(candidateId),
      scheduleMeeting: async (meeting: ScheduledMeeting) => {
        if (user?.role === "recruiter" && authStatus === "authenticated") {
          await createMeeting(meeting);
          await hydrate();
          return;
        }

        setMeetings((current) => ({
          ...current,
          [meeting.candidateId]: meeting,
        }));
      },
      saveProfile: async (profile: CandidateProfileInput) => {
        const response = await saveCandidateProfile(profile);
        setCandidateProfile(response.profile);
        await hydrate();
      },
      replyToThread: async (threadId: string, body: string) => {
        await replyToCandidateThread(threadId, body);
        await Promise.all([hydrate(), getCandidateThreadMessages(threadId)]).then(
          ([, messages]) => {
            setThreadMessages((current) => ({
              ...current,
              [threadId]: mergeChatMessages(current[threadId] ?? [], messages),
            }));
          },
        );
      },
      sendMessageToCandidate: async (candidateId: string, body: string) => {
        const thread = await sendRecruiterMessage(candidateId, body);
        const threadId = thread.id as string | undefined;
        await hydrate();
        if (threadId) {
          const messages = await getRecruiterThreadMessages(threadId);
          setThreadMessages((current) => ({
            ...current,
            [threadId]: mergeChatMessages(current[threadId] ?? [], messages),
          }));
        }
        return threadId;
      },
      loadThreadMessages: async (threadId: string) => {
        const messages =
          user?.role === "recruiter"
            ? await getRecruiterThreadMessages(threadId)
            : await getCandidateThreadMessages(threadId);
        setThreadMessages((current) => ({
          ...current,
          [threadId]: mergeChatMessages(current[threadId] ?? [], messages),
        }));
        return messages;
      },
      refreshData: hydrate,
    };
  }, [
    authStatus,
    candidateMetrics,
    candidateProfile,
    candidates,
    hydrate,
    interviews,
    meetings,
    metrics,
    notifications,
    pipeline,
    resetToAnonymous,
    savedCandidateIds,
    threadMessages,
    threads,
    user,
    router,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside RecruiterProvider");
  }

  return context;
}

export const useRecruiterState = useAppState;
