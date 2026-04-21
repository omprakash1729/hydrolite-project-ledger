import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProjectCard } from "@/components/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";

type Project = {
  id: string; name: string; client_name: string | null; location: string | null;
  project_date: string | null; total_budget: number;
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [actuals, setActuals] = useState<Record<string, { actual: number, estimated: number }>>({});
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data: ps } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    const { data: items } = await supabase.from("cost_items").select("project_id, actual_cost, estimated_cost");
    const m: Record<string, { actual: number, estimated: number }> = {};
    (items ?? []).forEach((i: any) => {
      const existing = m[i.project_id] || { actual: 0, estimated: 0 };
      existing.actual += (Number(i.actual_cost) || 0);
      existing.estimated += (Number(i.estimated_cost) || 0);
      m[i.project_id] = existing;
    });
    setProjects((ps ?? []) as Project[]);
    setActuals(m);
  };

  useEffect(() => { load(); }, []);

  const filtered = projects.filter((p) => {
    const s = q.toLowerCase();
    return !s || p.name.toLowerCase().includes(s) || (p.client_name ?? "").toLowerCase().includes(s);
  });

  return (
    <AppShell>
      <section className="mb-5 sm:mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">All construction sites and budgets.</p>
        </div>
        <Button
          size="sm"
          className="rounded-full gradient-primary text-primary-foreground border-0 hover:opacity-90 sm:h-10 sm:px-4"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </section>

      <div className="relative mb-4 sm:mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by project or client…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-10 rounded-full bg-card border-0 shadow-soft h-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 sm:p-10 shadow-soft text-center">
          <p className="text-muted-foreground">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} {...p} actual={actuals[p.id]?.actual ?? 0} estimated={actuals[p.id]?.estimated ?? 0} />
          ))}
        </div>
      )}

      <ProjectFormDialog open={open} onOpenChange={setOpen} onSaved={load} />
    </AppShell>
  );
};

export default Projects;
