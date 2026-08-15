import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Layers,
  Plus,
  BookOpen,
  Clock,
  User,
  Calendar,
  Trash2,
  Search,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Building2,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  api,
  type AttendanceSummaryResponse,
  type AttendanceResponse,
  type DepartmentItem,
} from "@/lib/api-client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/batches")({
  head: () => ({
    meta: [
      { title: "Department-Wise Batches & Attendance — Smart Attendance System" },
      {
        name: "description",
        content:
          "Create and manage batches organized by academic department, assign trainers, and track live attendance.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BatchesPage,
});

function BatchesPage() {
  const { role } = useApp();

  return <>{role === "admin" ? <AdminBatchesView /> : <StudentBatchesView />}</>;
}

// ==========================================
// STUDENT BATCHES & ATTENDANCE HISTORY VIEW
// ==========================================
function StudentBatchesView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  const fetchStudentData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [batchesData, summaryData, studentsData, reportData, deptsData] = await Promise.all([
        api.getBatches(),
        api.getMyAttendanceSummary(),
        api.getStudents(),
        api.getAttendanceReport(),
        api.getDepartments(),
      ]);
      setBatches(batchesData || []);
      setSummary(summaryData);
      setStudents(studentsData || []);
      setDepartments(deptsData || []);
      const logs = reportData && reportData.length > 0 ? reportData : summaryData?.records || [];
      setRecords(logs);
    } catch (err: any) {
      console.error("Failed to load student batch attendance:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

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

  const totalRegisteredStudents = students.length;
  const presentRecords = records.filter((r) => r.status === "PRESENT");
  const presentStudentsCount = presentRecords.length;

  const filteredBatches = batches.filter((b) => {
    if (selectedDept === "ALL") return true;
    return (
      (b.departmentName && b.departmentName.toLowerCase().includes(selectedDept.toLowerCase())) ||
      (b.departmentCode && b.departmentCode.toLowerCase() === selectedDept.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Batches & Attendance Control"
        subtitle="Track enrolled batches by department, total registered students, student presence counts, and live attendance history."
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
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {totalRegisteredStudents} Students
          </div>
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
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
            Total Absent Students
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {Math.max(totalRegisteredStudents - presentStudentsCount, 0)} Absent
          </div>
        </Card>
        <Card className="p-4 border border-primary/30 bg-primary/5">
          <div className="text-xs text-primary font-semibold">Overall Attendance Rate</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">
            {totalRegisteredStudents > 0
              ? ((presentStudentsCount / totalRegisteredStudents) * 100).toFixed(1)
              : "0.0"}
            %
          </div>
        </Card>
      </div>

      {/* DEPARTMENT FILTER TABS */}
      {departments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
            <Building2 className="h-3.5 w-3.5 text-primary" /> Filter by Department:
          </span>
          <button
            onClick={() => setSelectedDept("ALL")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
              selectedDept === "ALL"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Departments
          </button>
          {departments.map((d) => (
            <button
              key={d.code}
              onClick={() => setSelectedDept(d.name)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
                selectedDept === d.name
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {d.name} ({d.code})
            </button>
          ))}
        </div>
      )}

      {/* ENROLLED BATCHES CARDS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Active Enrolled Batches (
          {filteredBatches.length})
        </h3>

        {filteredBatches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBatches.map((b, idx) => {
              const code = b.batchCode || b.name || `BATCH-0${idx + 1}`;
              const matchingLogs = records.filter(
                (r) => r.subjectName === b.subjectName || r.subjectCode === code,
              );
              const presentCountInBatch = matchingLogs.filter((r) => r.status === "PRESENT").length;
              const totalStudentsInBatch = totalRegisteredStudents || 1;
              const batchPct =
                totalStudentsInBatch > 0
                  ? parseFloat(((presentCountInBatch / totalStudentsInBatch) * 100).toFixed(1))
                  : 0;

              return (
                <Card
                  key={b.id || idx}
                  className="border border-border/60 shadow-xs overflow-hidden bg-card"
                >
                  <CardHeader className="bg-muted/30 p-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs font-bold bg-primary/10 text-primary border-primary/20"
                        >
                          {code}
                        </Badge>
                        {b.departmentName && (
                          <Badge variant="outline" className="text-[10px] bg-muted text-foreground">
                            {b.departmentName}
                          </Badge>
                        )}
                      </div>
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                        ACTIVE
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-2">
                      {b.subjectName || b.name || "Subject Session"}
                    </CardTitle>
                    <CardDescription className="text-xs flex flex-wrap items-center gap-2 pt-1">
                      {b.branch && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {b.branch}
                        </span>
                      )}
                      {b.trainerName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {b.trainerName}
                        </span>
                      )}
                      {b.classTiming && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" /> {b.classTiming}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Batch Presence Rate</span>
                      <span className="font-bold font-mono text-foreground">{batchPct}%</span>
                    </div>
                    <Progress value={batchPct} className="h-2 rounded-full [&>div]:bg-primary" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
                      <span>{presentCountInBatch} Present Today</span>
                      <span>{totalRegisteredStudents} Enrolled</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
            No batches found for the selected department.
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ADMIN BATCHES MANAGEMENT VIEW
// ==========================================
function AdminBatchesView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Batch Form States
  const [batchCode, setBatchCode] = useState("");
  const [batchName, setBatchName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [subjectName, setSubjectName] = useState("");
  const [branch, setBranch] = useState("");
  const [classTiming, setClassTiming] = useState("");
  const [trainerName, setTrainerName] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [creating, setCreating] = useState(false);

  const fetchBatchesData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [batchesData, studentsData, reportData, deptsData] = await Promise.all([
        api.getBatches(),
        api.getStudents(),
        api.getAttendanceReport(),
        api.getDepartments(),
      ]);
      setBatches(batchesData || []);
      setStudents(studentsData || []);
      setRecords(reportData || []);
      setDepartments(deptsData || []);
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

  const handleOpenModal = (preselectedDeptId?: string) => {
    setBatchCode("");
    setBatchName("");
    setSubjectName("");
    setBranch("");
    setTrainerName("");
    setClassTiming("09:00");
    setStartDate(new Date().toISOString().split("T")[0]);

    if (preselectedDeptId) {
      setDepartmentId(preselectedDeptId);
    } else if (departments.length > 0) {
      setDepartmentId(String(departments[0].id));
    } else {
      setDepartmentId("");
    }

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

    const matchedDept = departments.find((d) => String(d.id) === String(departmentId));

    try {
      setCreating(true);
      const codeUpper = batchCode.trim().toUpperCase();
      const formattedTime = formatTime12H(classTiming);
      await api.createBatch({
        name: batchName.trim(),
        batchCode: codeUpper,
        departmentId: matchedDept?.id,
        departmentName: matchedDept?.name || "General",
        departmentCode: matchedDept?.code || "GEN",
        subjectName: subjectName.trim(),
        branch: branch.trim(),
        classTiming: formattedTime,
        trainerName: trainerName.trim(),
        startDate,
      });
      toast.success(
        `Batch ${codeUpper} created successfully under ${matchedDept?.name || "Department"}!`,
      );
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
    const matchesSearch =
      (b.batchCode && b.batchCode.toLowerCase().includes(q)) ||
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.subjectName && b.subjectName.toLowerCase().includes(q)) ||
      (b.branch && b.branch.toLowerCase().includes(q)) ||
      (b.trainerName && b.trainerName.toLowerCase().includes(q)) ||
      (b.departmentName && b.departmentName.toLowerCase().includes(q));

    const matchesDept =
      selectedDeptFilter === "ALL" ||
      (b.departmentName &&
        b.departmentName.toLowerCase().includes(selectedDeptFilter.toLowerCase())) ||
      (b.departmentCode && b.departmentCode.toLowerCase() === selectedDeptFilter.toLowerCase());

    return matchesSearch && matchesDept;
  });

  const totalRegisteredStudents = students.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Batch & Department Management"
        subtitle="Create batches organized under academic departments, configure class timings, assign faculty, and inspect live attendance."
        actions={
          <Button
            className="gap-2 text-xs font-semibold shadow-md"
            onClick={() => handleOpenModal()}
          >
            <Plus className="h-4 w-4" /> Create New Batch
          </Button>
        }
      />

      {/* CREATE BATCH MODAL WITH DEPARTMENT SELECTOR */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Layers className="h-5 w-5 text-primary" /> Create New Batch Code
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign this batch to an academic department. The batch will be stored under the
              selected department.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-3 pt-2">
            {/* DEPARTMENT SELECTOR */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Academic Department
              </Label>
              <select
                required
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full h-9 text-xs bg-background border border-border rounded-md px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Batch Code</Label>
                <Input
                  required
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="Enter batch code"
                  className="h-9 text-xs font-mono font-bold uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Batch Name</Label>
                <Input
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Enter batch name"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Subject</Label>
                <Input
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="Enter Subject"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Class Location</Label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Enter class location"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Class Timing</Label>
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
              <Label className="text-xs font-semibold">Faculty Lead</Label>
              <Input
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Enter faculty name"
                className="h-9 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creating} className="text-xs font-semibold">
                {creating ? "Creating..." : "Save Batch in Department"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DEPARTMENT FILTER TABS & SEARCH BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches by code, subject, department, or trainer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Total Batches: {filteredBatches.length}
          </span>
        </div>

        {/* DEPARTMENT TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDeptFilter("ALL")}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
              selectedDeptFilter === "ALL"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Departments ({batches.length})
          </button>
          {departments.map((d) => {
            const countInDept = batches.filter(
              (b) =>
                (b.departmentName &&
                  b.departmentName.toLowerCase().includes(d.name.toLowerCase())) ||
                (b.departmentCode && b.departmentCode.toLowerCase() === d.code.toLowerCase()),
            ).length;

            return (
              <button
                key={d.code}
                onClick={() => setSelectedDeptFilter(d.name)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
                  selectedDeptFilter === d.name
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.name} ({countInDept})
              </button>
            );
          })}
        </div>
      </div>

      {/* BATCHES TABLE WITH DEPARTMENT COLUMN */}
      <Card className="p-4 border border-border/60">
        <CardHeader className="px-0 pt-0 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Active Batches Created by Department
            </CardTitle>
            <CardDescription className="text-xs">
              Batches stored under each department with assigned trainer, class timings, and
              attendance status.
            </CardDescription>
          </div>
        </CardHeader>

        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading batches from database...
          </div>
        ) : filteredBatches.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Batch Code</TableHead>
                  <TableHead className="whitespace-nowrap">Department</TableHead>
                  <TableHead className="whitespace-nowrap">Subject</TableHead>
                  <TableHead className="whitespace-nowrap">Branch</TableHead>
                  <TableHead className="whitespace-nowrap">Class Time</TableHead>
                  <TableHead className="whitespace-nowrap">Trainer / Faculty</TableHead>
                  <TableHead className="whitespace-nowrap">Present Today</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((b) => {
                  const code = b.batchCode || b.name;
                  const matchingLogs = records.filter(
                    (r) => r.subjectName === b.subjectName || r.subjectCode === code,
                  );
                  const presentCountInBatch = matchingLogs.filter(
                    (r) => r.status === "PRESENT",
                  ).length;

                  return (
                    <TableRow key={b.id || b.batchCode}>
                      <TableCell className="font-mono text-xs font-bold text-primary flex items-center gap-1.5 whitespace-nowrap">
                        <span>{code}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopyCode(code)}
                        >
                          {copiedCode === code ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/20"
                        >
                          {b.departmentName || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {b.subjectName || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {b.branch || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono whitespace-nowrap">
                        {b.classTiming || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium whitespace-nowrap">
                        {b.trainerName || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {presentCountInBatch} Present
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        >
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
              <p className="text-xs text-muted-foreground">
                Click below to create a new Batch Code under an academic department.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-2 text-xs font-semibold"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4" /> Create New Batch Code Now
            </Button>
          </div>
        )}
      </Card>

      {/* REGISTERED STUDENTS ATTENDANCE ROSTER */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Registered Students Attendance Roster (
              {totalRegisteredStudents} Students)
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Live list of student names, emails, USNs, and attendance status.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20 w-fit"
          >
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs whitespace-nowrap">Student Name</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Email Address</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">USN / ID</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Department</TableHead>
                    <TableHead className="text-xs whitespace-nowrap">Time Marked</TableHead>
                    <TableHead className="text-right text-xs whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s: any, i: number) => {
                    const studentName =
                      s.name || (s.email ? s.email.split("@")[0] : `Student ${s.id}`);
                    const email = s.email || "student@mentormatrix.com";
                    const usn = s.usn || `STU100${s.id || i + 1}`;
                    const dept = s.department || "Computer Science";
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
                        : "—";

                    return (
                      <TableRow key={s.id || i}>
                        <TableCell className="font-semibold text-xs text-foreground flex items-center gap-2 whitespace-nowrap">
                          <User className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{studentName}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {email}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-primary whitespace-nowrap">
                          {usn}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="text-[10px] bg-muted/60">
                            {dept}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {timeMarked}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
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
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No registered students found in database.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
