import { useEffect, useState } from "react";

const TOKENS = ["--card", "--popover", "--background", "--foreground"] as const;

export const ThemeDebugPanel = () => {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const t of TOKENS) next[t] = styles.getPropertyValue(t).trim();
      setValues(next);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-50 rounded-2xl bg-card text-card-foreground shadow-glass p-3 text-xs font-mono space-y-1.5 border border-border max-w-[260px]">
      <div className="font-display font-bold text-[11px] uppercase tracking-wider opacity-70">Theme tokens</div>
      {TOKENS.map((t) => (
        <div key={t} className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded border border-border shrink-0"
            style={{ background: `hsl(${values[t] || "0 0% 100%"})` }}
          />
          <span className="opacity-70">{t}:</span>
          <span className="truncate">{values[t] || "—"}</span>
        </div>
      ))}
    </div>
  );
};
