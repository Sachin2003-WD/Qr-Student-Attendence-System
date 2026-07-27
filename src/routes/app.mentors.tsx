import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mentors } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { useState } from "react";
import { Search, Star, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/mentors")({
  head: () => ({
    meta: [
      { title: "Mentors — Mentor Matrix" },
      { name: "description", content: "Discover mentors matched to your goals." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentorsPage,
});

function MentorsPage() {
  const { role } = useApp();
  const [q, setQ] = useState("");
  const filtered = mentors.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.department.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title="Mentors"
        subtitle={role === "admin" ? "Manage the mentor directory." : "Recommended by department, skills, and capacity."}
        actions={role === "admin" ? <Button onClick={() => toast("New mentor modal (demo)")} className="gap-1"><UserPlus className="h-4 w-4" /> Add mentor</Button> : undefined}
      />
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search mentors…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="transition hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary font-semibold">{m.avatar}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{m.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{m.department}</div>
                </div>
                <span className="flex shrink-0 items-center gap-0.5 text-xs text-chart-4"><Star className="h-3 w-3 fill-current" />{m.rating}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {m.skills.map((s) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{m.students}/{m.capacity} students</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">View</Button>
                  {role === "student" ? <Button size="sm">Book</Button> : role === "admin" ? <Button size="sm" variant="outline">Assign</Button> : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
