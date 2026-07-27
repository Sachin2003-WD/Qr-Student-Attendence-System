import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sessions, mentorName, studentName } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Mentor Matrix" },
      { name: "description", content: "Calendar view of your mentoring sessions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const grid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const sessionsByDate = useMemo(() => {
    const m = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    }
    return m;
  }, []);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = iso(new Date());
  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Your monthly session timeline."
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="min-w-[10rem] px-2 text-center text-sm font-medium">{monthLabel}</div>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          </div>
        }
      />
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (!d) return <div key={i} className="min-h-[92px] rounded-lg" />;
              const key = iso(d);
              const items = sessionsByDate.get(key) ?? [];
              const isToday = key === today;
              return (
                <div key={i} className={cn("min-h-[92px] rounded-lg border p-1.5 text-left transition hover:border-primary/40", isToday && "border-primary bg-primary/5")}>
                  <div className={cn("mb-1 text-xs font-medium", isToday && "text-primary")}>{d.getDate()}</div>
                  <div className="space-y-1">
                    {items.slice(0, 2).map((s) => (
                      <div key={s.id} className="truncate rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        {s.time} · {s.topic}
                      </div>
                    ))}
                    {items.length > 2 && <div className="text-[10px] text-muted-foreground">+{items.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">This week</h2>
        {sessions.slice(0, 5).map((s) => (
          <Card key={s.id}>
            <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 sm:flex sm:justify-between">
              <div className="min-w-0">
                <div className="truncate font-medium">{s.topic}</div>
                <div className="truncate text-xs text-muted-foreground">{mentorName(s.mentor)} · {studentName(s.student)}</div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right text-xs text-muted-foreground">{s.date}<br />{s.time}</div>
                <Badge variant={s.status === "pending" ? "secondary" : "default"} className="capitalize">{s.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
