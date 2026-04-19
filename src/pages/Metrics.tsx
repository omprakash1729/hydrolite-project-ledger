import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { fmtCurrency } from "@/lib/format";

type Project = { id: string; name: string };
type Item = {
  project_id: string; item_name: string; category: string | null;
  estimated_cost: number; actual_cost: number;
};

const COLORS = ["hsl(327 100% 21%)", "hsl(219 53% 44%)", "hsl(219 70% 60%)", "hsl(327 60% 45%)", "hsl(158 64% 38%)", "hsl(35 90% 55%)", "hsl(280 60% 50%)"];

const Metrics = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data: ps } = await supabase.from("projects").select("id, name").order("created_at", { ascending: false });
      const { data: cs } = await supabase.from("cost_items").select("project_id, item_name, category, estimated_cost, actual_cost");
      setProjects((ps ?? []) as Project[]);
      setItems((cs ?? []) as Item[]);
    })();
  }, []);

  const filtered = useMemo(
    () => (selected === "all" ? items : items.filter((i) => i.project_id === selected)),
    [items, selected]
  );

  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    filtered.forEach((i) => {
      const k = i.category ?? "Other";
      m[k] = (m[k] ?? 0) + Number(i.actual_cost);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const variance = filtered.map((i) => ({
    name: i.item_name.length > 12 ? i.item_name.slice(0, 12) + "…" : i.item_name,
    Variance: Number(i.actual_cost) - Number(i.estimated_cost),
  }));

  return (
    <AppShell>
      <section className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Metrics</h1>
          <p className="text-muted-foreground">Cost breakdowns and variance analysis.</p>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-56 rounded-full bg-card border-0 shadow-soft">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <h2 className="font-display font-bold text-lg mb-4">Spend by Category</h2>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No data.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <h2 className="font-display font-bold text-lg mb-4">Variance per Item</h2>
          {variance.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No data.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={variance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ borderRadius: 12, border: "none" }} />
                  <Bar dataKey="Variance" radius={[8, 8, 0, 0]}>
                    {variance.map((d, i) => (
                      <Cell key={i} fill={d.Variance > 0 ? "hsl(var(--destructive))" : "hsl(var(--secondary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Metrics;
