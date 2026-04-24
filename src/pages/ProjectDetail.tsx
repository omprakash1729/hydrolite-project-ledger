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
  id: string; item_name: string; description: string | null;
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
    return { est, act, variance: est - act };
  }, [items]);

  if (!project) {
    return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  }

  const utilization = project.total_budget > 0 ? (totals.act / project.total_budget) * 100 : 0;

  const openEdit = (item: CostItem) => {
    setEditing({
      id: item.id,
      item_name: item.item_name,
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
      <div className="flex items-center justify-between mb-4 gap-2">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground min-w-0">
          <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">Back</span>
        </Link>
        <div className="flex gap-1.5 shrink-0">
          <Button variant="outline" size="sm" className="rounded-full h-9 px-3" onClick={() => setEditProject(true)}>
            <Edit className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Edit</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full h-9 px-3">
                <FileDown className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
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
          <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={deleteProject}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero card */}
      <section className="rounded-3xl gradient-primary text-primary-foreground p-5 sm:p-6 shadow-glass mb-5 sm:mb-6">
        {project.case_study_no && (
          <div className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80">{project.case_study_no}</div>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 leading-tight break-words">{project.name}</h1>
        <div className="mt-1 text-xs sm:text-sm opacity-90 flex flex-wrap gap-x-3 gap-y-0.5">
          {project.client_name && <span>{project.client_name}</span>}
          {project.location && <span>· {project.location}</span>}
          {project.project_date && <span>· {fmtDate(project.project_date)}</span>}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5">
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3 sm:p-4">
            <div className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wider">Total Budget</div>
            <div className="font-display text-lg sm:text-2xl font-bold mt-1 break-words">{fmtCurrency(project.total_budget)}</div>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3 sm:p-4">
            <div className="text-[10px] sm:text-xs opacity-80 uppercase tracking-wider">Actual Cost (AC)</div>
            <div className="font-display text-lg sm:text-2xl font-bold mt-1 break-words">{fmtCurrency(totals.act)}</div>
          </div>
        </div>

        <div className="mt-4 sm:mt-5">
          <div className="flex items-center justify-between text-xs mb-2 opacity-90">
            <span>Overall Utilization</span>
            <span className="font-semibold">{utilization.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(utilization, 100)}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
        <StatTile label="Budgeted Amount" value={fmtCurrency(totals.est)} tone="aqua" />
        <StatTile label="Actual Cost" value={fmtCurrency(totals.act)} />
        <StatTile
          label={totals.variance < 0 ? "Over Budget" : "Savings"}
          value={fmtCurrency(Math.abs(totals.variance))}
          tone={totals.variance < 0 ? "danger" : "success"}
        />
      </section>

      {/* Itemized */}
      <section className="rounded-2xl bg-card shadow-soft overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
          <h2 className="font-display font-bold text-base sm:text-lg">Itemized Costs</h2>
          <span className="text-[11px] sm:text-xs text-muted-foreground">Auto-saving</span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No items yet. Tap the + button to add your first cost line.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((it) => {
              const est = Number(it.estimated_cost);
              const act = Number(it.actual_cost);
              const variance = est - act;
              const over = variance < 0;
              const varPct = est > 0 ? (Math.abs(variance) / est) * 100 : 0;
              
              return (
                <button
                  key={it.id}
                  onClick={() => openEdit(it)}
                  className="w-full text-left px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-surface-1 transition-colors flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-sm sm:text-base">{it.item_name}</div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      Budget {fmtCurrency(est)}
                      {it.description && <span className="ml-2 italic text-muted-foreground opacity-80 break-all line-clamp-2 mt-1">— {it.description}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm sm:text-base font-semibold ${over ? "text-destructive" : "text-foreground"}`}>
                      {fmtCurrency(act)}
                    </div>
                    <div className={`text-[11px] ${over ? "text-destructive" : "text-success"}`}>
                      {fmtCurrencySigned(variance)} {varPct > 0 && `(${varPct.toFixed(0)}%)`}
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-surface-1 flex items-center gap-3 font-display font-bold">
              <div className="flex-1">Project Totals</div>
              <div className="text-right text-sm sm:text-base">
                {(() => {
                   const totalVarPct = totals.est > 0 ? (Math.abs(totals.variance) / totals.est) * 100 : 0;
                   return (
                     <>
                       <div className="text-muted-foreground text-[11px] font-sans font-normal">Budget {fmtCurrency(totals.est)}</div>
                       <div className={totals.variance < 0 ? "text-destructive" : "text-foreground"}>
                         {fmtCurrency(totals.act)}
                       </div>
                       <div className={`text-[11px] font-sans font-normal ${totals.variance < 0 ? "text-destructive" : "text-success"}`}>
                         {fmtCurrencySigned(totals.variance)} {totalVarPct > 0 && `(${totalVarPct.toFixed(1)}%)`}
                       </div>
                     </>
                   );
                })()}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FAB */}
      <button
        onClick={openNew}
        className="fixed bottom-24 right-5 sm:right-6 z-30 h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glass grid place-items-center hover:scale-105 transition-transform"
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
