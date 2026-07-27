import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sessions as allSessions, mentorName, studentName, type SessionStatus } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions — Mentor Matrix" },
      { name: "description", content: "Manage mentoring sessions: approve, reschedule, or cancel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sessions,
});

function statusVariant(s: SessionStatus): "default" | "secondary" | "destructive" | "outline" {
  return s === "upcoming" ? "default" : s === "pending" ? "secondary" : s === "cancelled" ? "destructive" : "outline";
}

function Sessions() {
  const { role } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const filtered = allSessions.filter((s) =>
    (status === "all" || s.status === status) &&
    (q === "" || s.topic.toLowerCase().includes(q.toLowerCase()) || mentorName(s.mentor).toLowerCase().includes(q.toLowerCase()) || studentName(s.student).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <PageHeader
        title={role === "mentor" ? "Session requests" : "Sessions"}
        subtitle="View, filter, and act on mentoring sessions."
      />
      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search topic, mentor, student…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-16 text-center text-sm text-muted-foreground">No sessions match your filters.</TableCell></TableRow>
              ) : filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.topic}</TableCell>
                  <TableCell>{mentorName(s.mentor)}</TableCell>
                  <TableCell>{studentName(s.student)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{s.date} · {s.time}</TableCell>
                  <TableCell><Badge variant={statusVariant(s.status)} className="capitalize">{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {s.status === "pending" && role === "mentor" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => toast.success("Rejected")}>Reject</Button>
                          <Button size="sm" onClick={() => toast.success("Approved")}>Approve</Button>
                        </>
                      )}
                      {s.status === "upcoming" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => toast("Reschedule modal (demo)")}>Reschedule</Button>
                          <Button size="sm" variant="destructive" onClick={() => toast.success("Cancelled")}>Cancel</Button>
                        </>
                      )}
                      {s.status === "completed" && role === "student" && (
                        <Button size="sm" variant="outline" onClick={() => toast("Feedback modal (demo)")}>Give feedback</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {allSessions.length}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled>Previous</Button>
            <Button size="sm" variant="outline">Next</Button>
          </div>
        </div>
      </Card>
    </>
  );
}
