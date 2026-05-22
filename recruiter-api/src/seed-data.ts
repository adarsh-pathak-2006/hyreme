import type { Candidate } from "@hyreme/shared";

export const seedCandidates: Omit<Candidate, "id" | "userId">[] = [
  {
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
];
