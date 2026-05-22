export const USER_ROLES = ["candidate", "recruiter", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
};

export type Candidate = {
  id: string;
  userId: string;
  name: string;
  role: string;
  location: string;
  headline: string;
  skills: string[];
  matchScore: number;
  experience: string;
  salary: string;
  availability: string;
  introDuration: string;
  introHook: string;
  reelSummary: string;
  preferredMeetingSlots: string[];
  reelMoments: string[];
  recruiterNote: string;
  resumeUrl?: string;
  videoUrl?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
};

export type RecruiterMetric = {
  label: string;
  value: string;
  change: string;
};

export type PipelineItem = {
  label: string;
  value: string;
  description: string;
};

export type MessageThread = {
  id: string;
  candidateId: string;
  recruiterId?: string;
  candidateName: string;
  role: string;
  counterpartyName?: string;
  counterpartyRole?: string;
  status: string;
  updatedAt: string;
  lastMessage: string;
};

export type InterviewItem = {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  stage: string;
  date: string;
  owner: string;
  mode: string;
  linkLabel: string;
  note?: string;
  status?: string;
};

export type ScheduledMeeting = {
  candidateId: string;
  date: string;
  time: string;
  mode: string;
  note: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderUserId: string;
  senderRole: "candidate" | "recruiter";
  body: string;
  createdAt: string;
};

export type DashboardSummary = {
  metrics: RecruiterMetric[];
  pipeline: PipelineItem[];
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type OtpRequestResponse = {
  message: string;
  otpCode?: string;
};

export type RecruiterDashboardResponse = DashboardSummary;

export type CandidateDashboardSummary = {
  metrics: RecruiterMetric[];
};

export type FeedResponse = {
  candidates: Candidate[];
  filters: string[];
};

export type SavedCandidatesResponse = {
  candidates: Candidate[];
  meetings: Record<string, ScheduledMeeting | undefined>;
};

export type AppBootstrapResponse = {
  user: AuthUser | null;
  dashboard: DashboardSummary;
  feed: FeedResponse;
  saved: SavedCandidatesResponse;
  messages: MessageThread[];
  interviews: InterviewItem[];
  notifications: NotificationItem[];
};

export type CandidateBootstrapResponse = {
  user: AuthUser | null;
  profile: Candidate | null;
  dashboard: CandidateDashboardSummary;
  messages: MessageThread[];
  interviews: InterviewItem[];
  notifications: NotificationItem[];
};
