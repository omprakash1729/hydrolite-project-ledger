import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/hydrolite-logo.png";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hydrolite logo" className="h-10 w-10 object-contain" />
            <div>
              <div className="font-display font-bold leading-tight">Hydrolite</div>
              <div className="text-[11px] text-muted-foreground leading-tight">Project Ledger</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="container pt-6">{children}</main>
      <BottomNav />
    </div>
  );
};
