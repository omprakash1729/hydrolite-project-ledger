
# Hydrolite Project Ledger

A full-stack pool construction cost tracker with the "Architectural Tectonic" design system from your DESIGN_1.md — deep maroon (#680035) + aquatic blue (#345cab), Plus Jakarta Sans + Inter, no-line tonal surfaces, glass modals, and gradient CTAs matching your reference screenshots.

## Tech Foundation
- **Frontend:** React + Vite + TypeScript + Tailwind (existing)
- **Backend:** Lovable Cloud (Supabase) — Postgres + Auth + RLS
- **Charts:** Recharts · **PDF:** jsPDF · **CSV:** native blob export

## Data Model (Lovable Cloud)
- `profiles` — user info (auto-created on signup)
- `projects` — id, user_id, name, client_name, location, project_date, case_study_no, total_budget, created_at
- `cost_items` — id, project_id, item_name, category, description, estimated_cost, actual_cost, created_at
- RLS: users only see/edit their own projects & items

## Screens & Flows

### 1. Auth (Login / Signup)
Email + password via Lovable Cloud. Maroon gradient CTA, glass card on aquatic-tinted background.

### 2. Dashboard (Home)
- Hero stats: Total Projects · Total Estimated · Total Actual · Net Profit/Loss
- Bar/line chart: Estimated vs Actual across all projects (Recharts)
- Recent projects list with utilization bars
- Filters: date range, search by project/client
- Bottom nav: Dashboard · Projects · Metrics

### 3. Projects List
Card grid of all projects showing budget, current spend, utilization %, status pill. "+" FAB to create new project (maroon gradient).

### 4. New / Edit Project Modal
Glass bottom-sheet modal: Project Name, Client, Location, Date, Case Study #, Total Budget.

### 5. Project Overview (matches your screenshot)
- Header: back arrow, "Project Overview", avatar, settings
- Hero card: Case Study #, project title (display-lg), Total Budget vs Current Spend tiles, Overall Utilization progress bar
- **Itemized Costs table:** Item Name (+ description) · Est. · Actual (color-coded: blue under-budget, red over-budget with ±$delta)
- Project Totals row
- Auto-saving indicator
- Tap row → Edit Line Item bottom-sheet (matches screenshot 1: category dropdown, estimated cost, actual cost, live variance info banner, Cancel / Save Changes)
- "+" FAB to add new line item
- Export menu: PDF report · CSV export

### 6. Metrics
Per-project charts: category breakdown (pie), variance by item (bar), profit/loss trend.

## Design System Implementation
- Tokens in `index.css`: maroon primary, aquatic secondary, surface hierarchy (#f8f9ff → #eff4ff → #d3e4fe), no borders — only tonal nesting
- Gradient utility for CTAs (135° primary → primary-container)
- Glass utility (80% opacity + 24px backdrop-blur) for modals & bottom nav
- Plus Jakarta Sans (display) + Inter (body) loaded via Google Fonts
- Reusable components: `StatTile`, `ProjectCard`, `CostRow`, `GlassSheet`, `GradientButton`, `UtilizationBar`, `BottomNav`

## Calculations (real-time)
- Per item: variance = actual − estimated (red if >0, blue if ≤0)
- Project: totals + utilization % + profit/loss
- Dashboard: aggregates across all user projects

## Export
- **PDF:** branded header, project info, itemized table, totals — via jsPDF + autotable
- **CSV:** all line items + totals row

## Out of Scope (v1)
Team collaboration, file attachments, multi-currency, offline mode.
