"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeedIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
    </svg>
  );
}

function SavedIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v14L12 16l-6.5 4V6A1.5 1.5 0 0 1 7 4.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MeetingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M8 3.5v3M16 3.5v3M3.5 9.5h17M8 13h3M8 16h6" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19a7 7 0 0 1 14 0" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const bottomNavItems = [
  { href: "/recruiter", label: "Home", Icon: HomeIcon },
  { href: "/recruiter/feed", label: "Feed", Icon: FeedIcon },
  { href: "/recruiter/saved", label: "Saved", Icon: SavedIcon },
  { href: "/recruiter/interviews", label: "Meetings", Icon: MeetingsIcon },
  { href: "/recruiter/account", label: "Account", Icon: AccountIcon },
];

const candidateNavItems = [
  { href: "/candidate", label: "Home", Icon: HomeIcon },
  { href: "/candidate/profile", label: "Profile", Icon: ProfileIcon },
  { href: "/candidate/messages", label: "Messages", Icon: FeedIcon },
  { href: "/candidate/interviews", label: "Meetings", Icon: MeetingsIcon },
  { href: "/candidate/account", label: "Account", Icon: AccountIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const isFeedRoute = pathname.startsWith("/recruiter/feed");
  const isCandidateRoute = pathname.startsWith("/candidate");
  const navItems = isCandidateRoute ? candidateNavItems : bottomNavItems;

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 lg:px-4 lg:pb-4">
      <div
        className={`mx-auto flex w-full items-center justify-between gap-2 border-t backdrop-blur transition-all duration-300
          lg:max-w-md lg:rounded-[1.6rem] lg:border lg:p-2 lg:shadow-[0_22px_70px_rgba(44,42,74,0.2)] xl:max-w-lg
          w-full px-6 py-2 pb-[calc(10px+env(safe-area-inset-bottom,0px))] lg:pb-2
          ${
            isFeedRoute
              ? "border-t-white/10 bg-[#100f1c]/95 text-white"
              : "border-t-[color:rgba(79,81,140,0.12)] bg-white/95 text-[color:rgba(44,42,74,0.62)]"
          }`}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/" || item.href === "/recruiter" || item.href === "/candidate"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={`flex h-12 flex-1 items-center justify-center transition lg:h-14 lg:rounded-[1.15rem] ${
                isActive
                  ? isFeedRoute
                    ? "text-white lg:bg-white lg:text-accent-deep"
                    : "text-[var(--accent-strong)] lg:bg-gradient-to-br lg:from-accent-strong lg:to-accent lg:text-white lg:shadow-[0_10px_30px_rgba(44,42,74,0.18)]"
                  : isFeedRoute
                    ? "text-white/50 hover:text-white"
                    : "text-[color:rgba(44,42,74,0.48)] hover:text-accent-deep"
              }`}
            >
              <item.Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
