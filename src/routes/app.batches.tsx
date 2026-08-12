import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Plus, BookOpen, Clock, User, Calendar, Trash2, Search, Copy, Check, CheckCircle2, RefreshCw, Building2, Users, Mail, IdCard } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api, type AttendanceSummaryResponse, type AttendanceResponse } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/batches")({
  head: () => ({
    meta: [
      { title: "Batches & Attendance — Smart Attendance System" },
      { name: "description", content: "View batch enrollment, registered student counts, and attendance history in real-time." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const { role } = useApp();

  return (
    <>
      {role === "admin" ? <AdminBatchesView /> : <StudentBatchesView />}
    </>
  );
}

// ==========================================
// STUDENT BATCHES & ATTENDANCE HISTORY VIEW
// ==========================================
function StudentBatchesView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [batchesData, summaryData, studentsData, reportData] = await Promise.all([
        api.getBatches(),
        api.getMyAttendanceSummary(),
        api.getStudents(),
        api.getAttendanceReport(),
      ]);
      setBatches(batchesData || []);
      setSummary(summaryData);
      setStudents(studentsData || []);
      const logs = (reportData && reportData.length > 0) ? reportData : (summaryData?.records || []);
      setRecords(logs);
    } catch (err: any) {
      console.error("Failed to load student batch attendance:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Realtime 3-second background polling & storage event listener
  useEffect(() => {
    fetchStudentData(false);
    const interval = setInterval(() => {
      fetchStudentData(true);
    }, 3000);

    const handleStorage = () => fetchStudentData(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchStudentData]);

  const totalRegisteredStudents = students.length > 0 ? students.length : 1;
  const presentRecords = records.filter((r) => r.status === "PRESENT");
  const presentStudentsCount = presentRecords.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Batches & Attendance Control"
        subtitle="Track enrolled batches, total registered students, student presence counts, and attendance history in real-time."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => fetchStudentData(false)}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Live Sync
          </Button>
        }
      />

      {/* OVERALL ATTENDANCE SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/60">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-primary" /> Total Registered Students
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{totalRegisteredStudents} Students</div>
        </Card>
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Total Present Students
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {presentStudentsCount} Present
          </div>
        </Card>
        <Card className="p-4 border border-rose-500/30 bg-rose-500/5">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Total Absent Students</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {Math.max(totalRegisteredStudents - presentStudentsCount, 0)} Absent
          </div>
        </Card>
        <Card className="p-4 border border-primary/30 bg-primary/5">
          <div className="text-xs text-primary font-semibold">Overall Attendance Rate</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">
            {totalRegisteredStudents > 0 ? ((presentStudentsCount / totalRegisteredStudents) * 100).toFixed(2) : "0.00"}%
          </div>
        </Card>
      </div>

      {/* ENROLLED BATCHES CARDS WITH REAL-TIME PRESENT/TOTAL STUDENTS METRICS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Active Enrolled Batches
        </h3>

        {batches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {batches.map((b, idx) => {
              const code = b.batchCode || b.name || `BATCH-0${idx + 1}`;
              const matchingLogs = records.filter(r => r.subjectName === b.subjectName || r.subjectCode === code || records.length > 0);
              const presentCountInBatch = matchingLogs.filter(r => r.status === "PRESENT").length;
              const totalStudentsInBatch = totalRegisteredStudents;
              const batchPct = totalStudentsInBatch > 0 ? parseFloat(((presentCountInBatch / totalStudentsInBatch) * 100).toFixed(2)) : 0;

              return (
                <Card key={b.id || idx} className="border border-border/60 shadow-xs overflow-hidden bg-card">
                  <CardHeader className="bg-muted/30 p-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-xs font-bold bg-primary/10 text-primary border-primary/20">
                        {code}
                      </Badge>
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                        ENROLLED
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-2">{b.subjectName || "Grooming & Skills"}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {b.branch || "Rajajinagar Jspiders"}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {b.trainerName || "Laxman Ashok Handenavar"}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3 font-mono" /> {b.classTiming || "04:45 PM"}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Batch Student Attendance:</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {presentCountInBatch} / {totalStudentsInBatch} Present Students ({batchPct}%)
                      </span>
                    </div>
                    <Progress value={batchPct} className="h-2 bg-muted" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground mt-2">No enrolled batches found.</p>
          </Card>
        )}
      </div>

      {/* DETAILED STUDENT ROSTER ATTENDANCE HISTORY TABLE WITH REALTIME UPDATES */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Batch Attendance Roster & History ({totalRegisteredStudents} Registered Students)
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Live real-time roster of registered student names, emails, USNs, and attendance status for active batches.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Realtime Auto-Syncing (3s)
          </Badge>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
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
                  {students.map((s: any, i: number) => {
                    const studentName = s.name || (s.email ? s.email.split("@")[0] : `Student ${s.id}`);
                    const email = s.email || "student@mentormatrix.com";
                    const usn = s.usn || `STU100${s.id || i + 1}`;
                    const matchRecord = records.find(r => r.userEmail === s.email || r.userName === s.name);
                    const isPresent = Boolean(matchRecord && matchRecord.status === "PRESENT");
                    const timeMarked = isPresent && matchRecord?.markedAt ? new Date(matchRecord.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

                    return (
                      <TableRow key={s.id || i}>
                        <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{studentName}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{email}</TableCell>
                        <TableCell className="text-xs font-mono font-bold text-primary">{usn}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{timeMarked}</TableCell>
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
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Time Marked</TableHead>
                    <TableHead className="text-right text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length > 0 ? (
                    records.slice(0, 10).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-xs font-mono">{r.date}</TableCell>
                        <TableCell className="text-xs font-semibold">{r.subjectName || "Grooming & Skills"}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={`text-[10px] font-bold ${
                              r.status === "PRESENT"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-rose-600 hover:bg-rose-700 text-white"
                            }`}
                          >
                            {r.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                        No attendance records logged yet. Use Smart QR Control to mark attendance.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// ADMIN BATCHES MANAGEMENT VIEW
// ==========================================
function AdminBatchesView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Batch Form States
  const [batchCode, setBatchCode] = useState("");
  const [batchName, setBatchName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [branch, setBranch] = useState("");
  const [classTiming, setClassTiming] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [creating, setCreating] = useState(false);

  const fetchBatchesData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [batchesData, studentsData, reportData] = await Promise.all([
        api.getBatches(),
        api.getStudents(),
        api.getAttendanceReport(),
      ]);
      setBatches(batchesData || []);
      setStudents(studentsData || []);
      setRecords(reportData || []);
    } catch {
      if (!silent) toast.error("Failed to load batches from database.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatchesData(false);
    const interval = setInterval(() => {
      fetchBatchesData(true);
    }, 3000);

    const handleStorage = () => fetchBatchesData(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchBatchesData]);

  const handleOpenModal = () => {
    setBatchCode("");
    setBatchName("");
    setSubjectName("");
    setBranch("");
    setTrainerName("");
    setClassTiming("09:00");
    setStartDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const formatTime12H = (time24: string): string => {
    if (!time24) return "09:00 AM";
    if (time24.includes("AM") || time24.includes("PM")) return time24;
    const [h, m] = time24.split(":");
    let hours = parseInt(h, 10);
    const minutes = m || "00";
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours < 10 ? "0" + hours : hours;
    return `${strHours}:${minutes} ${ampm}`;
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim() || !batchName.trim()) {
      toast.error("Please enter Batch Code and Batch Name");
      return;
    }

    try {
      setCreating(true);
      const codeUpper = batchCode.trim().toUpperCase();
      const formattedTime = formatTime12H(classTiming);
      await api.createBatch({
        name: batchName.trim(),
        batchCode: codeUpper,
        subjectName: subjectName.trim() || "General Subject",
        branch: branch.trim() || "Main Campus",
        classTiming: formattedTime,
        trainerName: trainerName.trim() || "Faculty Trainer",
        startDate,
      });
      toast.success(`Batch ${codeUpper} created successfully!`);
      setShowModal(false);
      fetchBatchesData(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create batch");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBatch = async (id: number | string, code: string) => {
    if (!confirm(`Are you sure you want to delete batch ${code}?`)) return;
    try {
      await api.deleteBatch(id);
      toast.success(`Batch ${code} deleted.`);
      fetchBatchesData(false);
    } catch {
      toast.error("Failed to delete batch.");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied ${code} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.batchCode && b.batchCode.toLowerCase().includes(q)) ||
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.subjectName && b.subjectName.toLowerCase().includes(q)) ||
      (b.branch && b.branch.toLowerCase().includes(q)) ||
      (b.trainerName && b.trainerName.toLowerCase().includes(q))
    );
  });

  const totalRegisteredStudents = students.length > 0 ? students.length : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Batch & Attendance Control"
        subtitle="Create batch codes, assign faculty trainers, configure class timings, and inspect real-time student batch attendance."
        actions={
          <Button className="gap-2 text-xs font-semibold shadow-md" onClick={handleOpenModal}>
            <Plus className="h-4 w-4" /> Create New Batch
          </Button>
        }
      />

      {/* CREATE BATCH MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Layers className="h-5 w-5 text-primary" /> Create New Batch Code
            </DialogTitle>
            <DialogDescription className="text-xs">
              Batch codes automatically appear in the Attendance Session Configuration list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Code</Label>
              <Input
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                placeholder="e.g. JAVA-2026-B1"
                className="h-9 text-xs font-mono font-bold uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Batch Full Name</Label>
              <Input
                required
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Java Full Stack Morning Batch"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Subject</Label>
                <Input
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Core Java & Spring Boot"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Branch Location</Label>
                <Input
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Bengaluru Main Campus"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Class Start Time</Label>
                <Input
                  type="time"
                  required
                  value={classTiming}
                  onChange={(e) => setClassTiming(e.target.value)}
                  className="h-9 text-xs font-mono cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs font-mono cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Trainer / Faculty Name</Label>
              <Input
                required
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="h-9 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating} className="text-xs font-semibold">
                {creating ? "Creating..." : "Save Batch in Database"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search batches by code, subject, branch, or trainer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Total Batches: {filteredBatches.length}
        </span>
      </div>

      {/* BATCHES TABLE WITH REAL-TIME PRESENT/TOTAL STUDENTS COUNT */}
      <Card className="p-4 border border-border/60">
        <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Active Batches & Student Presence
            </CardTitle>
            <CardDescription className="text-xs">
              Batch codes and real-time present vs registered student counts.
            </CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading batches from database...</div>
        ) : filteredBatches.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Trainer / Faculty</TableHead>
                  <TableHead>Present / Total Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((b) => {
                  const code = b.batchCode || b.name;
                  const matchingLogs = records.filter(r => r.subjectName === b.subjectName || r.subjectCode === code || records.length > 0);
                  const presentCountInBatch = matchingLogs.filter(r => r.status === "PRESENT").length;

                  return (
                    <TableRow key={b.id || b.batchCode}>
                      <TableCell className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                        <span>{code}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyCode(code)}
                        >
                          {copiedCode === code ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">{b.subjectName || "Grooming"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.branch || "Rajajinagar Jspiders"}</TableCell>
                      <TableCell className="text-xs font-mono">{b.classTiming || "04:45 PM"}</TableCell>
                      <TableCell className="text-xs font-medium">{b.trainerName || "Laxman Ashok Handenavar"}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {presentCountInBatch} / {totalRegisteredStudents} Present
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          ACTIVE
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => handleDeleteBatch(b.id, code)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center space-y-3 bg-card">
            <Layers className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <div className="space-y-1">
              <div className="text-sm font-bold">No Batches Created Yet</div>
              <p className="text-xs text-muted-foreground">Click the button below to create your first Batch Code.</p>
            </div>
            <Button size="sm" className="gap-2 text-xs font-semibold" onClick={handleOpenModal}>
              <Plus className="h-4 w-4" /> Create New Batch Code Now
            </Button>
          </div>
        )}
      </Card>

      {/* ADMIN STUDENT ATTENDANCE ROSTER FOR PARTICULAR BATCH */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Registered Students Attendance Roster ({totalRegisteredStudents} Students)
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Detailed list of student names, emails, USNs, and live attendance status for active batches.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Live Sync (3s)
          </Badge>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
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
                {students.map((s: any, i: number) => {
                  const studentName = s.name || (s.email ? s.email.split("@")[0] : `Student ${s.id}`);
                  const email = s.email || "student@mentormatrix.com";
                  const usn = s.usn || `STU100${s.id || i + 1}`;
                  const matchRecord = records.find(r => r.userEmail === s.email || r.userName === s.name);
                  const isPresent = Boolean(matchRecord && matchRecord.status === "PRESENT");
                  const timeMarked = isPresent && matchRecord?.markedAt ? new Date(matchRecord.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";

                  return (
                    <TableRow key={s.id || i}>
                      <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{studentName}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{email}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-primary">{usn}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{timeMarked}</TableCell>
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
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No registered students found in portal.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
