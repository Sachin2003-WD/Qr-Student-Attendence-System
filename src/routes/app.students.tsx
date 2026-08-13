import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { students } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Eye,
  Calendar,
  Clock,
  User,
  Building2,
  BookOpen,
  CheckCircle2,
  History,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { api, AttendanceResponse } from "@/lib/api-client";

export const Route = createFileRoute("/app/students")({
  head: () => ({
    meta: [
      { title: "Student Batches & Attendance — Smart Attendance System" },
      {
        name: "description",
        content: "Batch-wise student attendance cards, history, and student directory.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudentsPage,
});

interface BatchCard {
  id: number;
  batchCode: string;
  subject: string;
  branch: string;
  startDate: string;
  classTiming: string;
  trainer: string;
  classesAttended: string;
  attendancePercentage: number;
}

function StudentsPage() {
  const { role } = useApp();
  const [q, setQ] = useState("");
  const [batchesList, setBatchesList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyDateSearch, setHistoryDateSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudentPageData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [batchesData, studentsData, reportData, summaryData] = await Promise.all([
        api.getBatches(),
        api.getStudents(),
        api.getAttendanceReport(),
        api.getMyAttendanceSummary(),
      ]);
      setBatchesList(batchesData || []);
      setStudentsList(studentsData || []);
      const logs = reportData && reportData.length > 0 ? reportData : summaryData?.records || [];
      setRecords(logs);
    } catch (err) {
      console.error("Failed to load student batch data:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentPageData(false);
    const interval = setInterval(() => {
      fetchStudentPageData(true);
    }, 3000);

    const handleStorage = () => fetchStudentPageData(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const totalRegisteredStudents = studentsList.length > 0 ? studentsList.length : 1;

  const handleOpenHistory = (batch: any) => {
    setSelectedBatch(batch);
    setHistoryModalOpen(true);
  };

  return (
    <>
      <PageHeader
        title={role === "student" ? "My Enrolled Batches" : "Student Batches & Attendance"}
        subtitle="Batch-wise student presence tracking, percentage calculations, and session history."
        actions={
          role === "admin" ? (
            <Button
              className="gap-1 text-xs font-semibold"
              onClick={() => toast("Admin can create batches in Departments & Batches section")}
            >
              <UserPlus className="h-4 w-4" /> Admin Batch Cohort
            </Button>
          ) : undefined
        }
      />

      {/* BATCH CARDS INTERFACE */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Active Enrolled Batches
          </h2>
          <Badge
            variant="outline"
            className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            Realtime Live Sync (3s)
          </Badge>
        </div>

        {batchesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {batchesList.map((b, idx) => {
              const code = b.batchCode || b.name || `BATCH-0${idx + 1}`;
              const matchingLogs = records.filter(
                (r) =>
                  r.subjectName === b.subjectName || r.subjectCode === code || records.length > 0,
              );
              const presentCountInBatch = matchingLogs.filter((r) => r.status === "PRESENT").length;
              const totalStudentsInBatch = totalRegisteredStudents;
              const batchPct =
                totalStudentsInBatch > 0
                  ? parseFloat(((presentCountInBatch / totalStudentsInBatch) * 100).toFixed(2))
                  : 0;

              return (
                <Card
                  key={b.id || idx}
                  className="border border-border/60 hover:border-primary/50 transition-all shadow-xs overflow-hidden bg-card"
                >
                  <CardHeader className="bg-muted/30 pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-bold bg-primary/10 text-primary border-primary/20"
                      >
                        {code}
                      </Badge>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {batchPct}% Attendance
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                      {b.subjectName || "Grooming & Skills"}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Building2 className="h-3 w-3 text-muted-foreground" />{" "}
                      {b.branch || "Rajajinagar Jspiders"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Started At
                        </span>
                        <p className="font-medium text-foreground">
                          {b.startDate || "24-Jun-2026"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Class Timing
                        </span>
                        <p className="font-medium text-foreground font-mono">
                          {b.classTiming || "04:45 PM"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Trainer / Faculty
                      </span>
                      <p className="text-xs font-semibold text-foreground">
                        {b.trainerName || "Laxman Ashok Handenavar"}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Batch Student Presence:</span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {presentCountInBatch} / {totalStudentsInBatch} Present
                        </span>
                      </div>
                      <Progress value={batchPct} className="h-2 bg-muted" />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 gap-2 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary"
                      onClick={() => handleOpenHistory(b)}
                    >
                      <History className="h-3.5 w-3.5 text-primary" /> View Student Attendance
                      Roster
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-2 bg-card">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <div className="text-sm font-medium">No Active Batches Enrolled</div>
            <p className="text-xs text-muted-foreground">
              Admin has not configured any batches yet. Batches created by Admin will appear here
              dynamically.
            </p>
          </div>
        )}
      </div>

      {/* ATTENDANCE HISTORY MODAL WITH REAL STUDENT ROSTER (NAME, EMAIL, USN, TIME, STATUS) */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <History className="h-5 w-5 text-primary shrink-0" /> Student Attendance Roster —{" "}
              {selectedBatch?.batchCode || selectedBatch?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Batch: <strong>{selectedBatch?.subjectName || "Grooming"}</strong> | Branch:{" "}
              <strong>{selectedBatch?.branch || "Rajajinagar Jspiders"}</strong> | Trainer:{" "}
              <strong>{selectedBatch?.trainerName || "Laxman Ashok Handenavar"}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 w-full sm:max-w-xs">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search student name, email or USN..."
                  value={historyDateSearch}
                  onChange={(e) => setHistoryDateSearch(e.target.value)}
                  className="h-8 text-xs w-full"
                />
              </div>
              <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20 text-center sm:text-right">
                Total Registered: {totalRegisteredStudents} Students
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Email Address</TableHead>
                    <TableHead className="text-xs">USN / ID</TableHead>
                    <TableHead className="text-xs">Time Marked</TableHead>
                    <TableHead className="text-right text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsList
                    .filter((s) => {
                      if (!historyDateSearch.trim()) return true;
                      const query = historyDateSearch.toLowerCase();
                      return (
                        (s.name && s.name.toLowerCase().includes(query)) ||
                        (s.email && s.email.toLowerCase().includes(query)) ||
                        (s.usn && s.usn.toLowerCase().includes(query))
                      );
                    })
                    .map((s: any, i: number) => {
                      const studentName =
                        s.name || (s.email ? s.email.split("@")[0] : `Student ${s.id}`);
                      const email = s.email || "student@mentormatrix.com";
                      const usn = s.usn || `STU100${s.id || i + 1}`;
                      const matchRecord = records.find(
                        (r) => r.userEmail === s.email || r.userName === s.name,
                      );
                      const isPresent = Boolean(matchRecord && matchRecord.status === "PRESENT");
                      const timeMarked =
                        isPresent && matchRecord?.markedAt
                          ? new Date(matchRecord.markedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-";

                      return (
                        <TableRow key={s.id || i}>
                          <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{studentName}</span>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {email}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-bold text-primary">
                            {usn}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {timeMarked}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={`text-[10px] font-bold ${
                                isPresent
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  : "bg-rose-600 hover:bg-rose-700 text-white"
                              }`}
                            >
                              {isPresent ? "PRESENT ✓" : "ABSENT ✕"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
