import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { students, mentorName } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { useState } from "react";
import { Search, UserPlus, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/students")({
  head: () => ({
    meta: [
      { title: "Students — Mentor Matrix" },
      { name: "description", content: "Directory of students in the mentoring program." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const { role } = useApp();
  const [q, setQ] = useState("");
  const filtered = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.department.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader
        title={role === "mentor" ? "My students" : "Students"}
        subtitle={role === "mentor" ? "Track progress and give feedback." : "Manage students and mentor assignments."}
        actions={role === "admin" ? <Button className="gap-1" onClick={() => toast("New student modal (demo)")}><UserPlus className="h-4 w-4" /> Add student</Button> : undefined}
      />
      <Card className="p-4">
        <div className="mb-4 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search students…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="hidden md:table-cell">Semester</TableHead>
                <TableHead className="hidden md:table-cell">Mentor</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{s.avatar}</AvatarFallback></Avatar>
                      <div className="min-w-0"><div className="truncate font-medium">{s.name}</div><div className="truncate text-xs text-muted-foreground">{s.email}</div></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{s.department}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell">S{s.semester}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{mentorName(s.mentor)}</TableCell>
                  <TableCell className="min-w-[140px]">
                    <div className="flex items-center gap-2"><Progress value={s.progress} className="h-2" /><span className="text-xs text-muted-foreground">{s.progress}%</span></div>
                  </TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" className="gap-1"><Eye className="h-4 w-4" /> View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
