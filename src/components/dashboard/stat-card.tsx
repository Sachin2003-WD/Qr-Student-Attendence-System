import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  accent?: "primary" | "chart-2" | "chart-3" | "chart-4" | "chart-5";
}

export function StatCard({ label, value, icon: Icon, delta, accent = "primary" }: Props) {
  const bg = {
    primary: "bg-primary/10 text-primary",
    "chart-2": "bg-chart-2/10 text-chart-2",
    "chart-3": "bg-chart-3/10 text-chart-3",
    "chart-4": "bg-chart-4/10 text-chart-4",
    "chart-5": "bg-chart-5/10 text-chart-5",
  }[accent];

  return (
    <Card className="glass-card relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{value}</div>
            {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
          </div>
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", bg)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
