export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(n || 0);

export const fmtCurrencySigned = (n: number) => {
  const s = fmtCurrency(Math.abs(n));
  return n > 0 ? `+${s}` : n < 0 ? `-${s}` : s;
};

export const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const COST_CATEGORIES = [
  "Excavation & Site Prep",
  "Plumbing & Filtration",
  "Concrete & Masonry",
  "Tiles & Finishes",
  "Steel & Rebar",
  "Bricks & Cement",
  "Electrical",
  "Equipment",
  "Labor",
  "Landscaping",
  "Other",
] as const;
