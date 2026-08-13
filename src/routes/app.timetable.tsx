import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api-client";
import {
  Clock,
  Calendar,
  BookOpen,
  Building2,
  User,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/timetable")({
  head: () => ({
    meta: [
      { title: "Timetable — Smart Attendance System" },
      { name: "description", content: "Weekly class timetable and schedule overview." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TimetablePage,
});

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

const SUBJECT_COLORS = [
  {
    bg: "bg-blue-500/15",
    border: "border-blue-500/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-violet-500/15",
    border: "border-violet-500/40",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  {
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-500/15",
    border: "border-rose-500/40",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/40",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
];

function formatHour(hour: number): string {
  if (hour === 0 || hour === 12) return "12:00 " + (hour === 0 ? "AM" : "PM");
  return (hour > 12 ? hour - 12 : hour) + ":00 " + (hour >= 12 ? "PM" : "AM");
}

function parseTimeToHour(timing: string): number | null {
  if (!timing) return null;
  const match = timing.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h;
}

function getCurrentDayIndex(): number {
  const jsDay = new Date().getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1; // 0=Mon
}

function TimetablePage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [selectedDay, setSelectedDay] = useState(getCurrentDayIndex());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getBatches();
        setBatches(data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectColorMap = useMemo(() => {
    const map = new Map<string, (typeof SUBJECT_COLORS)[0]>();
    let idx = 0;
    for (const b of batches) {
      const key = b.subjectName || b.name || "Unknown";
      if (!map.has(key)) {
        map.set(key, SUBJECT_COLORS[idx % SUBJECT_COLORS.length]);
        idx++;
      }
    }
    return map;
  }, [batches]);

  // Place each batch into the grid at its class timing hour, distributed across days
  const timetableSlots = useMemo(() => {
    const slots: Map<string, any[]> = new Map();
    batches.forEach((b, batchIdx) => {
      const hour = parseTimeToHour(b.classTiming);
      if (hour === null) return;
      // Distribute batches across weekdays based on index
      const dayIdx = batchIdx % 6; // Mon-Sat
      const key = `${dayIdx}-${hour}`;
      const existing = slots.get(key) || [];
      existing.push(b);
      slots.set(key, existing);
    });
    return slots;
  }, [batches]);

  const currentHour = new Date().getHours();
  const todayIdx = getCurrentDayIndex();

  const renderSlotContent = (dayIdx: number, hour: number) => {
    const key = `${dayIdx}-${hour}`;
    const batchesInSlot = timetableSlots.get(key);
    if (!batchesInSlot || batchesInSlot.length === 0) return null;

    const isCurrentSlot = dayIdx === todayIdx && hour === currentHour;

    return batchesInSlot.map((b: any, i: number) => {
      const subject = b.subjectName || b.name || "Class";
      const colors = subjectColorMap.get(subject) || SUBJECT_COLORS[0];

      return (
        <div
          key={b.id || i}
          className={cn(
            "rounded-lg border p-2 transition-all hover:shadow-md cursor-default",
            colors.bg,
            colors.border,
            isCurrentSlot && "ring-2 ring-emerald-500/60 animate-pulse",
          )}
        >
          <div className={cn("text-[11px] font-bold truncate", colors.text)}>{subject}</div>
          <div className="text-[10px] text-muted-foreground truncate mt-0.5 flex items-center gap-1">
            <User className="h-2.5 w-2.5 shrink-0" /> {b.trainerName || "Faculty"}
          </div>
          <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
            <Building2 className="h-2.5 w-2.5 shrink-0" /> {b.branch || "Campus"}
          </div>
          <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-2.5 w-2.5 shrink-0" /> {b.classTiming || "—"}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <PageHeader
        title="Class Timetable"
        subtitle="Weekly schedule overview with batch sessions, faculty assignments, and real-time period tracking."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                className="rounded-none text-xs h-8 gap-1.5"
                onClick={() => setViewMode("week")}
              >
                <Calendar className="h-3.5 w-3.5" /> Week
              </Button>
              <Button
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                className="rounded-none text-xs h-8 gap-1.5"
                onClick={() => setViewMode("day")}
              >
                <Clock className="h-3.5 w-3.5" /> Day
              </Button>
            </div>
          </div>
        }
      />

      {/* Subject Color Legend */}
      {batches.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-muted-foreground">Subjects:</span>
          {Array.from(subjectColorMap.entries()).map(([name, colors]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className={cn("h-2.5 w-2.5 rounded-full", colors.dot)} />
              <span className="text-xs font-medium text-foreground">{name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Day Navigation for Day View */}
      {viewMode === "day" && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDay((prev) => (prev === 0 ? 6 : prev - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {DAY_SHORT.map((d, i) => (
              <Button
                key={d}
                variant={selectedDay === i ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "text-xs h-8 px-3",
                  i === todayIdx && selectedDay !== i && "border border-primary/30",
                )}
                onClick={() => setSelectedDay(i)}
              >
                {d}
                {i === todayIdx && <span className="ml-1 text-[9px] opacity-70">•</span>}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDay((prev) => (prev === 6 ? 0 : prev + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {loading ? (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center">
            <div className="text-xs text-muted-foreground animate-pulse">
              Loading timetable data...
            </div>
          </CardContent>
        </Card>
      ) : batches.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center space-y-3">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No Timetable Configured</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Batches will appear here once Administrator creates them. Your weekly class schedule
                will be automatically populated from configured batch sessions.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono bg-muted/30">
              Waiting for Admin to create batches
            </Badge>
          </CardContent>
        </Card>
      ) : viewMode === "week" ? (
        /* ====== WEEK VIEW ====== */
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/60">
                  <div className="p-2 text-center text-[10px] font-bold uppercase text-muted-foreground bg-muted/30 border-r border-border/40">
                    Time
                  </div>
                  {DAYS.map((day, i) => (
                    <div
                      key={day}
                      className={cn(
                        "p-2.5 text-center border-r border-border/40 last:border-r-0",
                        i === todayIdx
                          ? "bg-primary/10 text-primary font-bold"
                          : "bg-muted/20 text-muted-foreground",
                      )}
                    >
                      <div className="text-xs font-bold">{DAY_SHORT[i]}</div>
                      {i === todayIdx && (
                        <Badge className="text-[8px] mt-0.5 bg-primary text-primary-foreground px-1.5 py-0">
                          TODAY
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/30 last:border-b-0"
                  >
                    <div
                      className={cn(
                        "p-2 text-center text-[10px] font-mono font-semibold border-r border-border/40 flex items-start justify-center pt-3",
                        hour === currentHour
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground bg-muted/10",
                      )}
                    >
                      {formatHour(hour)}
                    </div>
                    {DAYS.map((_, dayIdx) => {
                      const content = renderSlotContent(dayIdx, hour);
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "p-1.5 min-h-[70px] border-r border-border/20 last:border-r-0 transition-colors",
                            dayIdx === todayIdx && "bg-primary/[0.03]",
                            hour === currentHour && dayIdx === todayIdx && "bg-primary/[0.06]",
                            !content && "hover:bg-muted/20",
                          )}
                        >
                          {content ? <div className="space-y-1">{content}</div> : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ====== DAY VIEW ====== */
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {DAYS[selectedDay]}'s Schedule
              {selectedDay === todayIdx && (
                <Badge className="text-[10px] bg-primary text-primary-foreground ml-2">TODAY</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {HOURS.map((hour) => {
              const content = renderSlotContent(selectedDay, hour);
              const isCurrentHourSlot = selectedDay === todayIdx && hour === currentHour;

              return (
                <div
                  key={hour}
                  className={cn(
                    "flex gap-4 items-start rounded-xl p-3 border transition-all",
                    isCurrentHourSlot
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : content
                        ? "border-border/60 bg-card hover:bg-muted/20"
                        : "border-border/20 bg-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "w-20 shrink-0 text-xs font-mono font-bold pt-0.5",
                      isCurrentHourSlot ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {formatHour(hour)}
                    {isCurrentHourSlot && (
                      <div className="text-[9px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                        NOW
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {content ? (
                      <div className="space-y-2">{content}</div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground/40 italic py-1">
                        No class scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </>
  );
}
