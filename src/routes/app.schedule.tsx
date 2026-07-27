import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mentors } from "@/lib/mock-data";
import { toast } from "sonner";
import { Star, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/schedule")({
  head: () => ({
    meta: [
      { title: "Book a session — Mentor Matrix" },
      { name: "description", content: "Book a mentoring session with an available mentor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Schedule,
});

function Schedule() {
  const nav = useNavigate();
  const [mentorId, setMentorId] = useState(mentors[0].id);
  return (
    <>
      <PageHeader title="Book a mentoring session" subtitle="Choose a mentor, pick a slot, and describe your topic." />
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader><CardTitle>Available mentors</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {mentors.map((m) => (
              <button
                key={m.id}
                onClick={() => setMentorId(m.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-left transition hover:border-primary/60 hover:bg-accent/40",
                  mentorId === m.id && "border-primary ring-2 ring-primary/20 bg-accent/60"
                )}
              >
                <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{m.avatar}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate font-medium">{m.name}</div>
                    <span className="flex shrink-0 items-center gap-0.5 text-xs text-chart-4"><Star className="h-3 w-3 fill-current" />{m.rating}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.department}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.skills.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">{s}</span>)}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">{m.students}/{m.capacity} students</div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle>Session details</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Session request sent");
                nav({ to: "/app/sessions" });
              }}
            >
              <div className="grid gap-2"><Label htmlFor="t">Topic</Label><Input id="t" placeholder="e.g. Interview preparation" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label htmlFor="d" className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Date</Label><Input id="d" type="date" required /></div>
                <div className="grid gap-2"><Label htmlFor="ti" className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Time</Label><Input id="ti" type="time" required /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="desc">Description</Label><Textarea id="desc" rows={4} placeholder="What would you like to discuss?" /></div>
              <Button type="submit" className="w-full">Send request</Button>
              <p className="text-center text-xs text-muted-foreground">Your mentor will approve or suggest another time.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
