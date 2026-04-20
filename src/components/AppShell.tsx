import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/hydrolite-logo.png";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 glass">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hydrolite logo" className="h-9 w-9 sm:h-10 sm:w-10 object-contain" />
            <div>
              <div className="font-display font-bold leading-tight text-sm sm:text-base">Hydrolite</div>
              <div className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">Project Ledger</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="container px-4 pt-4 sm:pt-6">{children}</main>
      <BottomNav />
    </div>
  );
};
