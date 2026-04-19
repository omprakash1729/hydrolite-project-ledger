import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatTile } from "@/components/StatTile";
import { ProjectCard } from "@/components/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { fmtCurrency } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Link } from "react-router-dom";

type Project = {
  id: string; name: string; client_name: string | null; location: string | null;
  project_date: string | null; total_budget: number;
};

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [actuals, setActuals] = useState<Record<string, { actual: number; estimated: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

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
      <section className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of every project, estimated vs actual.</p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatTile label="Projects" value={projects.length} tone="primary" />
        <StatTile label="Total Estimated" value={fmtCurrency(totals.est)} tone="aqua" />
        <StatTile label="Total Actual" value={fmtCurrency(totals.act)} />
        <StatTile
          label={totals.diff >= 0 ? "Net Profit" : "Net Loss"}
          value={fmtCurrency(Math.abs(totals.diff))}
          tone={totals.diff >= 0 ? "success" : "danger"}
        />
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft mb-6">
        <h2 className="font-display font-bold text-lg mb-4">Estimated vs Actual</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No project data yet.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "var(--shadow-soft)" }} />
                <Legend />
                <Bar dataKey="Estimated" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Actual" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-primary font-medium">View all →</Link>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 shadow-soft text-center">
            <p className="text-muted-foreground mb-3">No projects yet.</p>
            <Link to="/projects" className="text-primary font-medium">Create your first project →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
