import Link from "next/link";
import type { ReactNode } from "react";

type SectionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: {
    href: string;
    label: string;
  };
};

export function SectionCard({
  eyebrow,
  title,
  description,
  children,
  action,
}: SectionCardProps) {
  return (
    <section className="hyreme-glass rounded-[1.9rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--accent-deep)] sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:rgba(44,42,74,0.72)]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="hyreme-secondary-button inline-flex rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
