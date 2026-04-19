import { LayoutDashboard, FolderKanban, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/metrics", icon: BarChart3, label: "Metrics" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 glass shadow-glass rounded-full px-2 py-2 flex gap-1">
    {items.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
            isActive
              ? "gradient-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          )
        }
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </NavLink>
    ))}
  </nav>
);
