import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut, Waves } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary text-primary-foreground grid place-items-center">
              <Waves className="h-5 w-5" />
            </div>
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
