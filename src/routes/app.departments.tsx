import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { departments, mentors, students } from "@/lib/mock-data";
import { Building2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/departments")({
  head: () => ({
    meta: [
      { title: "Departments — Mentor Matrix" },
      { name: "description", content: "Manage academic departments and courses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Departments,
});

function Departments() {
  const [newDept, setNewDept] = useState("");
  return (
    <>
      <PageHeader title="Departments & courses" subtitle="Organize students and mentors by academic unit." />
      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <Input placeholder="New department name…" value={newDept} onChange={(e) => setNewDept(e.target.value)} className="max-w-md" />
        <Button onClick={() => { if (newDept.trim()) { toast.success(`Added ${newDept}`); setNewDept(""); } }} className="gap-1"><Plus className="h-4 w-4" /> Add</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const mCount = mentors.filter((m) => m.department === d).length;
          const sCount = students.filter((s) => s.department === d).length;
          return (
            <Card key={d} className="transition hover:-translate-y-0.5 hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                  <div className="text-right text-xs text-muted-foreground">{mCount} mentors<br />{sCount} students</div>
                </div>
                <div className="mt-3 font-semibold">{d}</div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">View</Button>
                  <Button size="sm" variant="ghost">Manage courses</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
