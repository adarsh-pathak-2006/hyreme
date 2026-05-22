type MetricCardProps = {
  label: string;
  value: string;
  change: string;
};

export function MetricCard({ label, value, change }: MetricCardProps) {
  return (
    <article className="rounded-[1.6rem] border border-[color:rgba(79,81,140,0.12)] bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(218,191,255,0.18))] p-5 shadow-[0_18px_50px_rgba(44,42,74,0.08)]">
      <p className="text-sm text-[color:rgba(44,42,74,0.6)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--accent-deep)]">
        {value}
      </p>
      <p className="mt-3 text-sm font-medium text-[var(--accent-strong)]">{change}</p>
    </article>
  );
}
