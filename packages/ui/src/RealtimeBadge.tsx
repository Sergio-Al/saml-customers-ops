export interface RealtimeBadgeProps {
  connected: boolean;
}

export function RealtimeBadge({ connected }: RealtimeBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? "bg-success animate-pulse" : "bg-text-muted"
        }`}
      />
      <span className="text-[11px] font-mono text-text-tertiary">
        {connected ? "Live" : "Offline"}
      </span>
    </span>
  );
}
