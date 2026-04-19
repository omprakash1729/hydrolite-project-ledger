import { cn } from "@/lib/utils";

export const UtilizationBar = ({ pct, className }: { pct: number; className?: string }) => {
  const clamped = Math.min(Math.max(pct, 0), 150);
  const tone = pct > 100 ? "bg-destructive" : pct > 85 ? "bg-primary" : "bg-secondary";
  return (
    <div className={cn("h-2 w-full rounded-full bg-surface-2 overflow-hidden", className)}>
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${(clamped / 150) * 100}%` }} />
    </div>
  );
};
