import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { UtilizationBar } from "./UtilizationBar";

type Props = {
  id: string;
  name: string;
  client_name: string | null;
  location: string | null;
  project_date: string | null;
  total_budget: number;
  actual: number;
};

export const ProjectCard = ({ id, name, client_name, location, project_date, total_budget, actual }: Props) => {
  const utilization = total_budget > 0 ? (actual / total_budget) * 100 : 0;
  const status = utilization > 100 ? "Over Budget" : utilization > 85 ? "Near Limit" : "On Track";
  const statusTone =
    utilization > 100
      ? "bg-destructive/10 text-destructive"
      : utilization > 85
      ? "bg-primary/10 text-primary"
      : "bg-secondary/10 text-secondary";

  return (
    <Link
      to={`/projects/${id}`}
      className="block rounded-2xl bg-card p-5 shadow-soft hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-lg leading-tight truncate">{name}</h3>
          {client_name && <p className="text-sm text-muted-foreground mt-0.5 truncate">{client_name}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusTone}`}>{status}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {location}
          </span>
        )}
        {project_date && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {fmtDate(project_date)}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Budget</div>
          <div className="font-display font-semibold">{fmtCurrency(total_budget)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Spent</div>
          <div className="font-display font-semibold">{fmtCurrency(actual)}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-medium">{utilization.toFixed(0)}%</span>
        </div>
        <UtilizationBar pct={utilization} />
      </div>
    </Link>
  );
};
