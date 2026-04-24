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
  description: string;
  estimated_cost: number | string;
  actual_cost: number | string;
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projectId: string;
  initial?: Partial<CostItemInput>;
  onSaved?: () => void;
};

const empty: CostItemInput = {
  item_name: "", description: "", estimated_cost: "", actual_cost: "",
};

export const CostItemDialog = ({ open, onOpenChange, projectId, initial, onSaved }: Props) => {
  const [form, setForm] = useState<CostItemInput>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...empty, ...initial });
      supabase.from("cost_items").select("item_name").then(({ data }) => {
        if (data) {
          const names = Array.from(new Set(data.map((d: any) => d.item_name).filter(Boolean)));
          setItemNames(names as string[]);
        }
      });
    }
  }, [open, initial]);

  const est = Number(form.estimated_cost) || 0;
  const act = Number(form.actual_cost) || 0;
  const variance = est - act;
  const overBudget = variance < 0;
  const variancePct = est > 0 ? (Math.abs(variance) / est) * 100 : 0;

  const update = <K extends keyof CostItemInput>(k: K, v: CostItemInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filteredItems = itemNames.filter((name) =>
    name.toLowerCase().includes((form.item_name || "").toLowerCase()) && name !== form.item_name
  );

  const submit = async () => {
    if (!form.item_name.trim()) {
      toast.error("Item name is required");
      return;
    }
    setSaving(true);
    const payload = {
      project_id: projectId,
      item_name: form.item_name.trim(),
      description: form.description.trim() || null,
      estimated_cost: est,
      actual_cost: act,
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
        <div className="relative">
          <Label>Item Name *</Label>
          <Input 
            value={form.item_name} 
            onChange={(e) => {
              update("item_name", e.target.value);
              setShowDropdown(true);
            }} 
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="e.g. Cement, Tiles, Labor" 
            autoComplete="off"
          />
          {showDropdown && filteredItems.length > 0 && (
            <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-card border border-border rounded-xl shadow-soft py-1.5 max-h-48 overflow-y-auto">
              {filteredItems.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-surface-1 transition-colors outline-none focus:bg-surface-1"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevents the input from losing focus immediately
                    update("item_name", name);
                    setShowDropdown(false);
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Budgeted Amount</Label>
            <Input type="number" min={0} inputMode="decimal" placeholder="0" value={form.estimated_cost}
              onChange={(e) => update("estimated_cost", e.target.value)} />
          </div>
          <div>
            <Label>Actual Cost (AC)</Label>
            <Input type="number" min={0} inputMode="decimal" placeholder="0" value={form.actual_cost}
              onChange={(e) => update("actual_cost", e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Explanations / Comments</Label>
          <Input value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Note any reasons for cost deviations..." />
        </div>

        <div className={`rounded-2xl p-3 flex items-center gap-2 text-sm ${
          overBudget ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
        }`}>
          {overBudget ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-medium">
            Variance: {fmtCurrencySigned(variance)} {variancePct > 0 && `(${variancePct.toFixed(1)}%)`} 
            {" "}({overBudget ? "over" : "under"} budget)
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
