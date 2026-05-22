import type { Candidate, InterviewItem, MessageThread } from "@/lib/types";

export const recruiterMetrics = [
  { label: "Qualified this week", value: "48", change: "+12% from last week" },
  { label: "Interviews booked", value: "19", change: "+6 new confirmations" },
  { label: "Response time", value: "2.4h", change: "Faster than team target" },
  { label: "Save-to-interview", value: "31%", change: "+4 points improvement" },
];

export const recruiterPipeline = [
  {
    label: "Saved for review",
    value: "27",
    description: "Candidates your team marked for deeper evaluation.",
  },
  {
    label: "Awaiting recruiter reply",
    value: "12",
    description: "Messaging threads where speed matters to avoid drop-off.",
  },
  {
    label: "Interview prep needed",
    value: "8",
    description: "Candidates with confirmed meetings in the next 72 hours.",
  },
];

export const candidateHighlights: Candidate[] = [
  {
    id: "cand-1",
    userId: "user-cand-1",
    name: "Aarav Menon",
    role: "Frontend Engineer",
    location: "Bengaluru",
    headline:
      "Builds polished React interfaces, explains tradeoffs clearly, and has led two product redesigns end to end.",
    skills: ["React", "Next.js", "TypeScript", "Motion Design", "Accessibility"],
    matchScore: 94,
    experience: "5 years",
    salary: "18-22 LPA",
    availability: "30 days",
    introDuration: "00:43",
    introHook: "I build product surfaces that feel fast, clear, and deeply usable.",
    reelSummary:
      "Walks through a commerce redesign, explains performance wins, and shows strong communication on tradeoffs.",
    preferredMeetingSlots: ["Mon 11:00 AM", "Tue 4:30 PM", "Wed 2:00 PM"],
    reelMoments: ["Redesign story", "Performance metrics", "Leadership style"],
    recruiterNote: "Strong for product-led frontend roles with stakeholder exposure.",
  },
  {
    id: "cand-2",
    userId: "user-cand-2",
    name: "Mira Kapoor",
    role: "Product Designer",
    location: "Mumbai",
    headline:
      "Strong storyteller with excellent portfolio walkthroughs and a bias toward measurable UX improvements.",
    skills: ["Product Design", "Figma", "Design Systems", "Research", "Prototyping"],
    matchScore: 91,
    experience: "6 years",
    salary: "20-24 LPA",
    availability: "Immediate",
    introDuration: "00:51",
    introHook: "My best design work starts where user confusion becomes measurable.",
    reelSummary:
      "Uses the reel to narrate portfolio outcomes and frame design thinking around business impact.",
    preferredMeetingSlots: ["Mon 3:00 PM", "Thu 12:30 PM", "Fri 5:00 PM"],
    reelMoments: ["Portfolio walkthrough", "Design systems", "Research synthesis"],
    recruiterNote: "Great visual communicator and likely strong in stakeholder reviews.",
  },
  {
    id: "cand-3",
    userId: "user-cand-3",
    name: "Ishaan Patel",
    role: "Growth Marketer",
    location: "Pune",
    headline:
      "Comfortable on camera, sharp at performance marketing, and speaks directly about experiments, outcomes, and failures.",
    skills: ["Performance Marketing", "Meta Ads", "Analytics", "SEO", "Lifecycle"],
    matchScore: 88,
    experience: "4 years",
    salary: "14-18 LPA",
    availability: "45 days",
    introDuration: "00:39",
    introHook: "I care about repeatable growth loops more than one lucky campaign.",
    reelSummary:
      "Talks through failed experiments, iteration cadence, and channel-level accountability.",
    preferredMeetingSlots: ["Tue 11:30 AM", "Thu 3:00 PM", "Fri 1:00 PM"],
    reelMoments: ["Experiment process", "Paid growth wins", "Failure analysis"],
    recruiterNote: "Could be a good fit where execution speed matters more than brand polish.",
  },
  {
    id: "cand-4",
    userId: "user-cand-4",
    name: "Sara Thomas",
    role: "Customer Success Lead",
    location: "Hyderabad",
    headline:
      "Brings executive presence, customer empathy, and a clear escalation playbook for high-growth SaaS teams.",
    skills: ["Customer Success", "Renewals", "Onboarding", "CRM", "Escalations"],
    matchScore: 90,
    experience: "7 years",
    salary: "16-20 LPA",
    availability: "15 days",
    introDuration: "00:47",
    introHook: "Retention gets better when escalation paths feel calm instead of chaotic.",
    reelSummary:
      "Shows executive presence and explains how she handles renewals, onboarding, and risk accounts.",
    preferredMeetingSlots: ["Mon 5:00 PM", "Wed 11:00 AM", "Fri 4:00 PM"],
    reelMoments: ["Enterprise renewals", "Escalation playbook", "Customer empathy"],
    recruiterNote: "Very strong verbal clarity. Good leadership signal on camera.",
  },
  {
    id: "cand-5",
    userId: "user-cand-5",
    name: "Karan Bedi",
    role: "Backend Engineer",
    location: "Delhi",
    headline:
      "Strong communicator with deep Node.js and distributed systems experience, especially for product teams moving fast.",
    skills: ["Node.js", "PostgreSQL", "Redis", "APIs", "System Design"],
    matchScore: 92,
    experience: "5.5 years",
    salary: "22-28 LPA",
    availability: "60 days",
    introDuration: "00:44",
    introHook: "I like backend systems that stay boring under pressure.",
    reelSummary:
      "Explains API design, caching, and incident ownership in a grounded, practical way.",
    preferredMeetingSlots: ["Tue 2:00 PM", "Wed 6:00 PM", "Thu 11:00 AM"],
    reelMoments: ["System design", "Incident handling", "API scaling"],
    recruiterNote: "Very relevant for teams rebuilding infrastructure fundamentals.",
  },
  {
    id: "cand-6",
    userId: "user-cand-6",
    name: "Neha Reddy",
    role: "Talent Operations",
    location: "Chennai",
    headline:
      "Blends recruiting coordination with hiring analytics and keeps candidate communication crisp and human.",
    skills: ["Talent Ops", "Scheduling", "ATS", "Reporting", "Candidate Experience"],
    matchScore: 86,
    experience: "3 years",
    salary: "9-12 LPA",
    availability: "Immediate",
    introDuration: "00:36",
    introHook: "Hiring feels smoother when every touchpoint respects candidate time.",
    reelSummary:
      "Highlights scheduling, recruiter coordination, and reporting with a calm operational voice.",
    preferredMeetingSlots: ["Mon 2:30 PM", "Tue 5:00 PM", "Thu 10:00 AM"],
    reelMoments: ["Scheduling ops", "Candidate communication", "Reporting discipline"],
    recruiterNote: "Strong fit for a fast-moving recruiting operations lane.",
  },
];

export const feedFilters = [
  "Frontend",
  "Design",
  "Remote ready",
  "Immediate joiners",
  "Leadership",
  "English fluency",
];

export const messageThreads: MessageThread[] = [
  {
    id: "thread-1",
    candidateId: "cand-1",
    candidateName: "Aarav Menon",
    role: "Frontend Engineer",
    status: "Awaiting recruiter reply",
    updatedAt: "10 minutes ago",
    lastMessage:
      "Happy to share my architecture case study and can speak with your engineering manager tomorrow afternoon.",
  },
  {
    id: "thread-2",
    candidateId: "cand-2",
    candidateName: "Mira Kapoor",
    role: "Product Designer",
    status: "Interview details shared",
    updatedAt: "35 minutes ago",
    lastMessage:
      "Thanks for the invite. I have confirmed the Thursday slot and will bring examples from my fintech design system work.",
  },
  {
    id: "thread-3",
    candidateId: "cand-4",
    candidateName: "Sara Thomas",
    role: "Customer Success Lead",
    status: "New message",
    updatedAt: "1 hour ago",
    lastMessage:
      "I can walk your team through my retention playbook and the escalation matrix I used for enterprise renewals.",
  },
];

export const interviewSchedule: InterviewItem[] = [
  {
    id: "int-1",
    candidateId: "cand-5",
    candidateName: "Karan Bedi",
    role: "Backend Engineer",
    stage: "Technical round",
    date: "Mon, 26 May - 11:00 AM",
    owner: "Ritika Sharma",
    mode: "Google Meet",
    linkLabel: "Meet link ready",
  },
  {
    id: "int-2",
    candidateId: "cand-2",
    candidateName: "Mira Kapoor",
    role: "Product Designer",
    stage: "Portfolio review",
    date: "Tue, 27 May - 4:30 PM",
    owner: "Naveen Sethi",
    mode: "Zoom",
    linkLabel: "Zoom scheduled",
  },
  {
    id: "int-3",
    candidateId: "cand-6",
    candidateName: "Neha Reddy",
    role: "Talent Operations",
    stage: "Culture conversation",
    date: "Wed, 28 May - 2:00 PM",
    owner: "Aisha Khan",
    mode: "Google Meet",
    linkLabel: "Invite pending confirmation",
  },
];
