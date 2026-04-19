import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { fmtCurrency, fmtCurrencySigned, fmtDate } from "@/lib/format";
import { ArrowLeft, Plus, Edit, FileDown, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CostItemDialog, CostItemInput } from "@/components/CostItemDialog";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { UtilizationBar } from "@/components/UtilizationBar";
import { StatTile } from "@/components/StatTile";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportProjectCSV, exportProjectPDF } from "@/lib/exporters";
import { toast } from "sonner";

type Project = {
  id: string; name: string; client_name: string | null; location: string | null;
  project_date: string | null; case_study_no: string | null; total_budget: number;
};
type CostItem = {
  id: string; item_name: string; category: string | null; description: string | null;
  estimated_cost: number; actual_cost: number;
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<CostItem[]>([]);
  const [itemOpen, setItemOpen] = useState(false);
  const [editing, setEditing] = useState<CostItemInput | undefined>();
  const [editProject, setEditProject] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data: p } = await supabase.from("projects").select("*").eq("id", id).single();
    const { data: cs } = await supabase.from("cost_items").select("*").eq("project_id", id).order("created_at");
    setProject(p as Project);
    setItems((cs ?? []) as CostItem[]);
  };

  useEffect(() => { load(); }, [id]);

  const totals = useMemo(() => {
    const est = items.reduce((s, i) => s + Number(i.estimated_cost), 0);
    const act = items.reduce((s, i) => s + Number(i.actual_cost), 0);
    return { est, act, variance: act - est };
  }, [items]);

  if (!project) {
    return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  }

  const utilization = project.total_budget > 0 ? (totals.act / project.total_budget) * 100 : 0;

  const openEdit = (item: CostItem) => {
    setEditing({
      id: item.id,
      item_name: item.item_name,
      category: item.category ?? "Other",
      description: item.description ?? "",
      estimated_cost: Number(item.estimated_cost),
      actual_cost: Number(item.actual_cost),
    });
    setItemOpen(true);
  };

  const openNew = () => { setEditing(undefined); setItemOpen(true); };

  const deleteProject = async () => {
    if (!confirm(`Delete "${project.name}" and all its items?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted");
    navigate("/projects");
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => setEditProject(true)}>
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <FileDown className="h-3.5 w-3.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={() => exportProjectPDF(project, items)}>
                <FileText className="h-4 w-4 mr-2" /> PDF Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportProjectCSV(project, items)}>
                <FileDown className="h-4 w-4 mr-2" /> CSV Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={deleteProject}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero card */}
      <section className="rounded-3xl gradient-primary text-primary-foreground p-6 shadow-glass mb-6">
        {project.case_study_no && (
          <div className="text-xs uppercase tracking-widest opacity-80">{project.case_study_no}</div>
        )}
        <h1 className="font-display text-3xl font-bold mt-1 leading-tight">{project.name}</h1>
        <div className="mt-1 text-sm opacity-90 flex flex-wrap gap-x-4">
          {project.client_name && <span>{project.client_name}</span>}
          {project.location && <span>· {project.location}</span>}
          {project.project_date && <span>· {fmtDate(project.project_date)}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
            <div className="text-xs opacity-80 uppercase tracking-wider">Total Budget</div>
            <div className="font-display text-2xl font-bold mt-1">{fmtCurrency(project.total_budget)}</div>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
            <div className="text-xs opacity-80 uppercase tracking-wider">Current Spend</div>
            <div className="font-display text-2xl font-bold mt-1">{fmtCurrency(totals.act)}</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-2 opacity-90">
            <span>Overall Utilization</span>
            <span className="font-semibold">{utilization.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(utilization, 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Estimated" value={fmtCurrency(totals.est)} tone="aqua" />
        <StatTile label="Actual" value={fmtCurrency(totals.act)} />
        <StatTile
          label={totals.variance >= 0 ? "Over Estimate" : "Under Estimate"}
          value={fmtCurrency(Math.abs(totals.variance))}
          tone={totals.variance > 0 ? "danger" : "success"}
        />
      </section>

      {/* Itemized */}
      <section className="rounded-2xl bg-card shadow-soft overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-display font-bold text-lg">Itemized Costs</h2>
          <span className="text-xs text-muted-foreground">Auto-saving</span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No items yet. Add your first cost line.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((it) => {
              const variance = Number(it.actual_cost) - Number(it.estimated_cost);
              const over = variance > 0;
              return (
                <button
                  key={it.id}
                  onClick={() => openEdit(it)}
                  className="w-full text-left px-5 py-4 hover:bg-surface-1 transition-colors grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-6 min-w-0">
                    <div className="font-semibold truncate">{it.item_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {it.category ?? "Uncategorized"}{it.description ? ` · ${it.description}` : ""}
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="text-xs text-muted-foreground">Est.</div>
                    <div className="text-sm">{fmtCurrency(Number(it.estimated_cost))}</div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="text-xs text-muted-foreground">Actual</div>
                    <div className={`text-sm font-semibold ${over ? "text-destructive" : "text-secondary"}`}>
                      {fmtCurrency(Number(it.actual_cost))}
                    </div>
                    <div className={`text-[11px] ${over ? "text-destructive" : "text-secondary"}`}>
                      {fmtCurrencySigned(variance)}
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="px-5 py-4 bg-surface-1 grid grid-cols-12 gap-3 items-center font-display font-bold">
              <div className="col-span-6">Project Totals</div>
              <div className="col-span-3 text-right">{fmtCurrency(totals.est)}</div>
              <div className={`col-span-3 text-right ${totals.variance > 0 ? "text-destructive" : "text-secondary"}`}>
                {fmtCurrency(totals.act)}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FAB */}
      <button
        onClick={openNew}
        className="fixed bottom-24 right-6 z-30 h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glass grid place-items-center hover:scale-105 transition-transform"
        aria-label="Add line item"
      >
        <Plus className="h-6 w-6" />
      </button>

      <CostItemDialog
        open={itemOpen}
        onOpenChange={setItemOpen}
        projectId={project.id}
        initial={editing}
        onSaved={load}
      />
      <ProjectFormDialog
        open={editProject}
        onOpenChange={setEditProject}
        initial={{
          id: project.id, name: project.name, client_name: project.client_name ?? "",
          location: project.location ?? "", project_date: project.project_date ?? "",
          case_study_no: project.case_study_no ?? "", total_budget: Number(project.total_budget),
        }}
        onSaved={load}
      />
    </AppShell>
  );
};

export default ProjectDetail;
