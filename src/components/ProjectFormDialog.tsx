import { useEffect, useState } from "react";
import { GlassSheet } from "./GlassSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export type ProjectInput = {
  id?: string;
  name: string;
  client_name: string;
  location: string;
  project_date: string;
  case_study_no: string;
  total_budget: number;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Partial<ProjectInput>;
  onSaved?: (id: string) => void;
};

const empty: ProjectInput = {
  name: "", client_name: "", location: "", project_date: "", case_study_no: "", total_budget: 0,
};

export const ProjectFormDialog = ({ open, onOpenChange, initial, onSaved }: Props) => {
  const { user } = useAuth();
  const [form, setForm] = useState<ProjectInput>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...empty, ...initial });
  }, [open, initial]);

  const update = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      client_name: form.client_name.trim() || null,
      location: form.location.trim() || null,
      project_date: form.project_date || null,
      case_study_no: form.case_study_no.trim() || null,
      total_budget: Number(form.total_budget) || 0,
      user_id: user.id,
    };
    const { data, error } = form.id
      ? await supabase.from("projects").update(payload).eq("id", form.id).select().single()
      : await supabase.from("projects").insert(payload).select().single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Project updated" : "Project created");
    onOpenChange(false);
    if (data) onSaved?.(data.id);
  };

  return (
    <GlassSheet
      open={open}
      onOpenChange={onOpenChange}
      title={form.id ? "Edit Project" : "New Project"}
      description="Capture core details for this construction site."
    >
      <div className="space-y-4 mt-2">
        <div>
          <Label>Project Name *</Label>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Backyard Pool — Smith Residence" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Client</Label>
            <Input value={form.client_name} onChange={(e) => update("client_name", e.target.value)} />
          </div>
          <div>
            <Label>Case Study #</Label>
            <Input value={form.case_study_no} onChange={(e) => update("case_study_no", e.target.value)} placeholder="CS-2024-001" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.project_date} onChange={(e) => update("project_date", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Total Budget (USD)</Label>
          <Input
            type="number"
            min={0}
            value={form.total_budget}
            onChange={(e) => update("total_budget", Number(e.target.value))}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full gradient-primary text-primary-foreground border-0 hover:opacity-90"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Saving…" : form.id ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </div>
    </GlassSheet>
  );
};
