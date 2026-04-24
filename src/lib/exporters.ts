import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmtCurrency, fmtCurrencySigned, fmtDate } from "./format";

type Project = {
  name: string; client_name: string | null; location: string | null;
  project_date: string | null; case_study_no: string | null; total_budget: number;
};
type Item = {
  item_name: string; description: string | null;
  estimated_cost: number; actual_cost: number;
};

export function exportProjectPDF(project: Project, items: Item[]) {
  const doc = new jsPDF();
  // Branded header (maroon)
  doc.setFillColor(104, 0, 53);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255);
  doc.setFontSize(18);
  doc.text("Hydrolite Project Ledger", 14, 14);
  doc.setFontSize(10);
  doc.text("Budget vs Actual Cost Report", 14, 22);

  doc.setTextColor(20);
  doc.setFontSize(14);
  doc.text(project.name, 14, 42);
  doc.setFontSize(10);
  doc.setTextColor(90);
  const meta = [
    project.case_study_no && `Case Study: ${project.case_study_no}`,
    project.client_name && `Client: ${project.client_name}`,
    project.location && `Location: ${project.location}`,
    project.project_date && `Date: ${fmtDate(project.project_date)}`,
    `Total Budget: ${fmtCurrency(project.total_budget)}`,
  ].filter(Boolean) as string[];
  meta.forEach((line, i) => doc.text(line, 14, 50 + i * 5));

  const totalEst = items.reduce((s, i) => s + Number(i.estimated_cost || 0), 0);
  const totalAct = items.reduce((s, i) => s + Number(i.actual_cost || 0), 0);

  autoTable(doc, {
    startY: 50 + meta.length * 5 + 6,
    head: [["Item", "Comments", "Budgeted Amount", "Actual Cost (AC)", "Variance", "Variance %"]],
    body: items.map((i) => {
      const est = Number(i.estimated_cost || 0);
      const act = Number(i.actual_cost || 0);
      const varAmt = est - act;
      const pct = est > 0 ? (Math.abs(varAmt) / est) * 100 : 0;
      return [
        i.item_name,
        i.description ?? "—",
        fmtCurrency(est),
        fmtCurrency(act),
        fmtCurrencySigned(varAmt),
        pct > 0 ? pct.toFixed(1) + "%" : "0%"
      ];
    }),
    foot: [["Totals", "", fmtCurrency(totalEst), fmtCurrency(totalAct), fmtCurrencySigned(totalEst - totalAct), totalEst > 0 ? ((Math.abs(totalEst - totalAct) / totalEst) * 100).toFixed(1) + "%" : "0%"]],
    headStyles: { fillColor: [52, 92, 171], textColor: 255 },
    footStyles: { fillColor: [104, 0, 53], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    theme: "grid",
  });

  doc.save(`${project.name.replace(/\s+/g, "_")}_report.pdf`);
}

export function exportProjectCSV(project: Project, items: Item[]) {
  const totalEst = items.reduce((s, i) => s + Number(i.estimated_cost || 0), 0);
  const totalAct = items.reduce((s, i) => s + Number(i.actual_cost || 0), 0);
  const totalVar = totalEst - totalAct;
  const totalPct = totalEst > 0 ? (Math.abs(totalVar) / totalEst) * 100 : 0;

  const rows = [
    ["Item", "Comments", "Budgeted Amount", "Actual Cost (AC)", "Variance", "Variance %"],
    ...items.map((i) => {
      const est = Number(i.estimated_cost || 0);
      const act = Number(i.actual_cost || 0);
      const varAmt = est - act;
      const pct = est > 0 ? (Math.abs(varAmt) / est) * 100 : 0;
      return [
        i.item_name,
        i.description ?? "",
        String(est),
        String(act),
        String(varAmt),
        pct > 0 ? pct.toFixed(1) + "%" : "0%"
      ];
    }),
    [],
    ["Totals", "",
      String(totalEst),
      String(totalAct),
      String(totalVar),
      totalPct > 0 ? totalPct.toFixed(1) + "%" : "0%"
    ],
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
