import { useEffect, useState } from "react";
import { GlassSheet } from "./GlassSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fmtCurrencySigned } from "@/lib/format";
import { Trash2, TrendingDown, TrendingUp } from "lucide-react";

export type CostItemInput = {
  id?: string;
  item_name: string;
  category: string;
  description: string;
  estimated_cost: number;
  actual_cost: number;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  initial?: Partial<CostItemInput>;
  onSaved?: () => void;
};

const empty: CostItemInput = {
  item_name: "", category: "", description: "", estimated_cost: 0, actual_cost: 0,
};

export const CostItemDialog = ({ open, onOpenChange, projectId, initial, onSaved }: Props) => {
  const [form, setForm] = useState<CostItemInput>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ ...empty, ...initial });
  }, [open, initial]);

  const variance = (Number(form.actual_cost) || 0) - (Number(form.estimated_cost) || 0);
  const overBudget = variance > 0;

  const update = <K extends keyof CostItemInput>(k: K, v: CostItemInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    setSaving(true);
    const payload = {
      project_id: projectId,
      item_name: form.item_name.trim(),
      category: form.category || null,
      description: form.description.trim() || null,
      estimated_cost: Number(form.estimated_cost) || 0,
      actual_cost: Number(form.actual_cost) || 0,
    };
    const { error } = form.id
      ? await supabase.from("cost_items").update(payload).eq("id", form.id)
      : await supabase.from("cost_items").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(form.id ? "Item updated" : "Item added");
    onOpenChange(false);
    onSaved?.();
  };

  const remove = async () => {
    if (!form.id) return;
    if (!confirm("Delete this line item?")) return;
    const { error } = await supabase.from("cost_items").delete().eq("id", form.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item deleted");
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <GlassSheet
      open={open}
      onOpenChange={onOpenChange}
      title={form.id ? "Edit Line Item" : "Add Line Item"}
    >
      <div className="space-y-4 mt-2">
        <div>
          <Label>Item Name *</Label>
          <Input value={form.item_name} onChange={(e) => update("item_name", e.target.value)} placeholder="e.g. Cement, Tiles, Labor" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Estimated Cost</Label>
            <Input type="number" min={0} value={form.estimated_cost}
              onChange={(e) => update("estimated_cost", Number(e.target.value))} />
          </div>
          <div>
            <Label>Actual Cost</Label>
            <Input type="number" min={0} value={form.actual_cost}
              onChange={(e) => update("actual_cost", Number(e.target.value))} />
          </div>
        </div>

        <div className={`rounded-2xl p-3 flex items-center gap-2 text-sm ${
          overBudget ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
        }`}>
          {overBudget ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-medium">
            Variance: {fmtCurrencySigned(variance)} ({overBudget ? "over" : "under"} estimate)
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          {form.id && (
            <Button variant="outline" size="icon" className="rounded-full text-destructive" onClick={remove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" className="flex-1 rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full gradient-primary text-primary-foreground border-0 hover:opacity-90"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </GlassSheet>
  );
};
