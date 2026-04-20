import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatTile } from "@/components/StatTile";
import { ProjectCard } from "@/components/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { fmtCurrency } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";

type Project = {
  id: string; name: string; client_name: string | null; location: string | null;
  project_date: string | null; total_budget: number;
};

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [actuals, setActuals] = useState<Record<string, { actual: number; estimated: number }>>({});
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  const load = async () => {
    const { data: ps } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    const { data: items } = await supabase.from("cost_items").select("project_id, estimated_cost, actual_cost");
    const map: Record<string, { actual: number; estimated: number }> = {};
    (items ?? []).forEach((i: any) => {
      const m = (map[i.project_id] ||= { actual: 0, estimated: 0 });
      m.actual += Number(i.actual_cost) || 0;
      m.estimated += Number(i.estimated_cost) || 0;
    });
    setProjects((ps ?? []) as Project[]);
    setActuals(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    let est = 0, act = 0;
    Object.values(actuals).forEach(({ estimated, actual }) => { est += estimated; act += actual; });
    return { est, act, diff: est - act };
  }, [actuals]);

  const chartData = projects.slice(0, 8).map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    Estimated: actuals[p.id]?.estimated ?? 0,
    Actual: actuals[p.id]?.actual ?? 0,
  }));

  return (
    <AppShell>
      <section className="mb-5 sm:mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Estimated vs actual across every project.</p>
        </div>
        <Button
          size="sm"
          className="rounded-full gradient-primary text-primary-foreground border-0 hover:opacity-90 sm:h-10 sm:px-4"
          onClick={() => setOpenNew(true)}
        >
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </section>

      <ProjectFormDialog open={openNew} onOpenChange={setOpenNew} onSaved={load} />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 sm:mb-6">
        <StatTile label="Projects" value={projects.length} tone="primary" />
        <StatTile label="Total Estimated" value={fmtCurrency(totals.est)} tone="aqua" />
        <StatTile label="Total Actual" value={fmtCurrency(totals.act)} />
        <StatTile
          label={totals.diff >= 0 ? "Net Profit" : "Net Loss"}
          value={fmtCurrency(Math.abs(totals.diff))}
          tone={totals.diff >= 0 ? "success" : "danger"}
        />
      </section>

      <section className="rounded-2xl bg-card p-4 sm:p-5 shadow-soft mb-5 sm:mb-6">
        <h2 className="font-display font-bold text-base sm:text-lg mb-3 sm:mb-4">Estimated vs Actual</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No project data yet.</p>
        ) : (
          <div className="h-56 sm:h-64 -ml-2 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} width={50} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-soft)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Estimated" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base sm:text-lg">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-primary font-medium">View all →</Link>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-soft text-center">
            <p className="text-muted-foreground mb-3">No projects yet.</p>
            <button onClick={() => setOpenNew(true)} className="text-primary font-medium">Create your first project →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {projects.slice(0, 4).map((p) => (
              <ProjectCard key={p.id} {...p} actual={actuals[p.id]?.actual ?? 0} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default Dashboard;
