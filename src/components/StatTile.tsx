import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "primary" | "aqua" | "success" | "danger";
  className?: string;
};

export const StatTile = ({ label, value, hint, tone = "default", className }: Props) => {
  const toneClasses = {
    default: "bg-card text-card-foreground",
    primary: "gradient-primary text-primary-foreground",
    aqua: "gradient-aqua text-secondary-foreground",
    success: "bg-success text-success-foreground",
    danger: "bg-destructive text-destructive-foreground",
  }[tone];

  return (
    <div className={cn("rounded-2xl p-5 shadow-soft", toneClasses, className)}>
      <div className="text-xs uppercase tracking-wider opacity-80 font-medium">{label}</div>
      <div className="mt-2 text-2xl font-display font-bold leading-tight">{value}</div>
      {hint && <div className="mt-1 text-xs opacity-80">{hint}</div>}
    </div>
  );
};
