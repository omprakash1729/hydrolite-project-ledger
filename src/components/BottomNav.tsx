import { LayoutDashboard, FolderKanban } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
];

export const BottomNav = () => (
  <nav
    className="fixed bottom-3 sm:bottom-4 left-1/2 z-40 -translate-x-1/2 glass shadow-glass rounded-full px-1.5 py-1.5 sm:px-2 sm:py-2 flex gap-1"
    style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
  >
    {items.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        end={to === "/"}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium transition-all",
            isActive
              ? "gradient-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          )
        }
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);
