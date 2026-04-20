import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import logo from "@/assets/hydrolite-logo.png";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: name } },
      });
      if (error) toast.error(error.message);
      else toast.success("Account created. You're signed in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full gradient-aqua opacity-30 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full gradient-primary opacity-25 blur-3xl" />

      <div className="relative w-full max-w-md glass shadow-glass rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="Hydrolite logo" className="h-14 w-14 object-contain" />
          <div>
            <h1 className="font-display text-2xl font-bold">Hydrolite</h1>
            <p className="text-sm text-muted-foreground">Project Ledger</p>
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold mb-1">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Track estimated vs actual costs across every pool build.
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label>Display Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Carter" />
            </div>
          )}
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="w-full rounded-full gradient-primary text-primary-foreground border-0 hover:opacity-90 h-11"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <button
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
