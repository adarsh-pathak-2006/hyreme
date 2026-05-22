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
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 lg:hidden">
      <div
        className={`mx-auto flex w-full max-w-md items-center justify-between gap-2 rounded-[1.6rem] border p-2 shadow-[0_22px_70px_rgba(44,42,74,0.2)] backdrop-blur xl:max-w-lg ${
          isFeedRoute
            ? "border-white/12 bg-[var(--accent-deep)]/74 text-white"
            : "border-[color:rgba(79,81,140,0.12)] bg-white/92 text-[color:rgba(44,42,74,0.62)]"
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
              className={`flex h-14 flex-1 items-center justify-center rounded-[1.15rem] transition ${
                isActive
                  ? isFeedRoute
                    ? "bg-white text-accent-deep"
                    : "bg-gradient-to-br from-accent-strong to-accent text-white shadow-[0_10px_30px_rgba(44,42,74,0.18)]"
                  : isFeedRoute
                    ? "text-white/72 hover:bg-white/10 hover:text-white"
                    : "hover:bg-accent-soft/22 hover:text-accent-deep"
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
