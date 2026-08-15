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
  Building2,
  Plus,
  Users,
  CheckCircle2,
  TrendingUp,
  Search,
  RefreshCw,
  Trash2,
  Award,
  MapPin,
  UserCheck,
  BarChart3,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  api,
  type DepartmentItem,
  type DepartmentAttendanceData,
  type AttendanceResponse,
} from "@/lib/api-client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/departments")({
  head: () => ({
    meta: [
      { title: "Department-Wise Batches & Attendance — Smart Attendance System" },
      {
        name: "description",
        content:
          "Track department-wise batches, attendance percentages, student enrollment, and academic units.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DepartmentsAttendancePage,
});

function DepartmentsAttendancePage() {
  const { role } = useApp();
  const [departmentsData, setDepartmentsData] = useState<DepartmentAttendanceData[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);

  // New Department Form state
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [description, setDescription] = useState("");
  const [hodName, setHodName] = useState("");
  const [location, setLocation] = useState("");
  const [creatingDept, setCreatingDept] = useState(false);

  // New Batch Form state (for creating batch under department)
  const [targetDeptId, setTargetDeptId] = useState<string>("");
  const [batchCode, setBatchCode] = useState("");
  const [batchName, setBatchName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [branch, setBranch] = useState("");
  const [classTiming, setClassTiming] = useState("09:00");
  const [trainerName, setTrainerName] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [creatingBatch, setCreatingBatch] = useState(false);

  const fetchDepartmentData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [deptStats, batchesList, studentsList, reportLogs] = await Promise.all([
        api.getDepartmentWiseAttendance(),
        api.getBatches(),
        api.getStudents(),
        api.getAttendanceReport(),
      ]);
      setDepartmentsData(deptStats || []);
      setBatches(batchesList || []);
      setStudents(studentsList || []);
      setRecords(reportLogs || []);
    } catch {
      if (!silent) toast.error("Failed to load department attendance data.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Real-time 3s auto-sync
  useEffect(() => {
    fetchDepartmentData(false);
    const interval = setInterval(() => {
      fetchDepartmentData(true);
    }, 3000);

    const handleStorage = () => fetchDepartmentData(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchDepartmentData]);

  const handleOpenCreateModal = () => {
    setDeptName("");
    setDeptCode("");
    setDescription("");
    setHodName("");
    setLocation("");
    setShowCreateModal(true);
  };

  const handleOpenCreateBatchForDept = (d: DepartmentAttendanceData) => {
    setTargetDeptId(String(d.departmentId));
    setBatchCode(`${d.departmentCode}-2026-A`);
    setBatchName(`${d.departmentName} Section A`);
    setSubjectName("");
    setBranch(d.location || "Main Campus");
    setTrainerName(d.hodName || "");
    setClassTiming("09:00");
    setStartDate(new Date().toISOString().split("T")[0]);
    setShowCreateBatchModal(true);
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      toast.error("Please enter Department Name and Department Code");
      return;
    }

    try {
      setCreatingDept(true);
      const codeUpper = deptCode.trim().toUpperCase();
      await api.createDepartment({
        name: deptName.trim(),
        code: codeUpper,
        description: description.trim(),
        hodName: hodName.trim(),
        location: location.trim(),
      });
      toast.success(`Department ${deptName.trim()} (${codeUpper}) created successfully!`);
      setShowCreateModal(false);
      fetchDepartmentData(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create department");
    } finally {
      setCreatingDept(false);
    }
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

  const handleCreateBatchUnderDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCode.trim() || !batchName.trim()) {
      toast.error("Please enter Batch Code and Batch Name");
      return;
    }

    const matchedDept = departmentsData.find(
      (d) => String(d.departmentId) === String(targetDeptId),
    );

    try {
      setCreatingBatch(true);
      const codeUpper = batchCode.trim().toUpperCase();
      const formattedTime = formatTime12H(classTiming);
      await api.createBatch({
        name: batchName.trim(),
        batchCode: codeUpper,
        departmentId: matchedDept?.departmentId,
        departmentName: matchedDept?.departmentName || "General",
        departmentCode: matchedDept?.departmentCode || "GEN",
        subjectName: subjectName.trim(),
        branch: branch.trim(),
        classTiming: formattedTime,
        trainerName: trainerName.trim(),
        startDate,
      });
      toast.success(
        `Batch ${codeUpper} created under ${matchedDept?.departmentName || "department"}!`,
      );
      setShowCreateBatchModal(false);
      fetchDepartmentData(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create batch");
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleDeleteDepartment = async (id: number | string, name: string) => {
    if (!confirm(`Are you sure you want to remove the ${name} department?`)) return;
    try {
      await api.deleteDepartment(id);
      toast.success(`Department ${name} removed.`);
      fetchDepartmentData(false);
    } catch {
      toast.error("Failed to remove department.");
    }
  };

  // Aggregated Metrics
  const totalDepartments = departmentsData.length;
  const totalBatchesCount = batches.length;
  const totalEnrolledAcrossDepts = students.length;
  const totalPresentToday = records.filter((r) => r.status === "PRESENT").length;
  const avgAttendancePercentage =
    departmentsData.length > 0
      ? (
          departmentsData.reduce((acc, d) => acc + (d.attendancePercentage || 0), 0) /
          departmentsData.length
        ).toFixed(1)
      : "0.0";

  const topPerformingDept =
    departmentsData.length > 0
      ? [...departmentsData].sort(
          (a, b) => (b.attendancePercentage || 0) - (a.attendancePercentage || 0),
        )[0]
      : null;

  // Filtered Student Attendance Roster
  const rosterStudents = students.map((s: any, idx: number) => {
    const studentDept = s.department || "General";
    const studentName = s.name || (s.email ? s.email.split("@")[0] : `Student ${s.id || idx + 1}`);
    const email = s.email || `student${idx + 1}@college.edu`;
    const usn = s.usn || `1RA21CS00${s.id || idx + 1}`;

    const matchRecord = records.find(
      (r) => r.userEmail?.toLowerCase() === email.toLowerCase() || r.userName === studentName,
    );
    const isPresent = Boolean(matchRecord && matchRecord.status === "PRESENT");
    const markedTime =
      isPresent && matchRecord?.markedAt
        ? new Date(matchRecord.markedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

    return {
      id: s.id || idx,
      name: studentName,
      email,
      usn,
      department: studentDept,
      subjectName: matchRecord?.subjectName || "—",
      isPresent,
      markedTime,
    };
  });

  const filteredRoster = rosterStudents.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.usn.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q) ||
      item.subjectName.toLowerCase().includes(q);

    const matchesDept =
      selectedDeptFilter === "ALL" ||
      item.department.toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
      selectedDeptFilter.toLowerCase().includes(item.department.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PRESENT" && item.isPresent) ||
      (statusFilter === "ABSENT" && !item.isPresent);

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department-Wise Attendance & Academic Units"
        subtitle="Manage academic departments, create and organize batches department-wise, and inspect live attendance statistics."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => fetchDepartmentData(false)}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Sync Live
            </Button>
            {role === "admin" && (
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={handleOpenCreateModal}
              >
                <Plus className="h-4 w-4" /> Add Department
              </Button>
            )}
          </div>
        }
      />

      {/* TOP ANALYTICS OVERVIEW CARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Total Departments</span>
              <div className="text-2xl font-bold text-foreground">{totalDepartments}</div>
              <span className="text-[11px] text-muted-foreground">Active Academic Units</span>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Total Batches Created
              </span>
              <div className="text-2xl font-bold text-primary">{totalBatchesCount}</div>
              <span className="text-[11px] text-muted-foreground">Across all departments</span>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/10 text-purple-600">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Total Enrolled Students
              </span>
              <div className="text-2xl font-bold text-foreground">{totalEnrolledAcrossDepts}</div>
              <span className="text-[11px] text-emerald-600 font-mono font-semibold">
                {totalPresentToday} Present Today
              </span>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1 min-w-0 pr-2">
              <span className="text-xs font-medium text-muted-foreground">Avg Dept Attendance</span>
              <div className="text-2xl font-bold text-emerald-600">{avgAttendancePercentage}%</div>
              {topPerformingDept && (
                <span className="text-[10px] text-amber-600 font-medium truncate block">
                  Top: {topPerformingDept.departmentName} ({topPerformingDept.attendancePercentage}
                  %)
                </span>
              )}
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DEPARTMENT-WISE LIVE BREAKDOWN & BATCHES */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Academic Departments & Created Batches
            </h2>
            <p className="text-xs text-muted-foreground">
              Batches and student attendance records stored under each academic department.
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            Live Auto-Updated
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {departmentsData.map((d) => {
            const isSelected =
              selectedDeptFilter === d.departmentName || selectedDeptFilter === d.departmentCode;
            const pct = d.attendancePercentage || 0;
            const isHigh = pct >= 85;
            const isMedium = pct >= 70 && pct < 85;

            // Find batches created under this department
            const deptBatches = batches.filter(
              (b) =>
                (b.departmentId && String(b.departmentId) === String(d.departmentId)) ||
                (b.departmentName &&
                  (b.departmentName.toLowerCase() === d.departmentName.toLowerCase() ||
                    d.departmentName.toLowerCase().includes(b.departmentName.toLowerCase()))) ||
                (b.departmentCode &&
                  b.departmentCode.toLowerCase() === d.departmentCode.toLowerCase()),
            );

            return (
              <Card
                key={d.departmentId || d.departmentCode}
                onClick={() => setSelectedDeptFilter(isSelected ? "ALL" : d.departmentName)}
                className={`p-4 border transition-all cursor-pointer rounded-2xl relative ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/60 hover:border-primary/40 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {d.departmentName}
                      </h3>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{d.location || "Academic Wing"}</span>
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] font-bold bg-muted text-foreground border-border shrink-0"
                  >
                    {d.departmentCode}
                  </Badge>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/40 text-center my-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">Batches</div>
                    <div className="text-sm font-bold text-primary font-mono">
                      {deptBatches.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">Students</div>
                    <div className="text-sm font-bold text-foreground font-mono">
                      {d.totalStudents}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Present Today
                    </div>
                    <div className="text-sm font-bold text-emerald-600 font-mono">
                      {d.presentCount}
                    </div>
                  </div>
                </div>

                {/* Batches Created Under This Department */}
                <div className="space-y-1.5 py-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium text-[11px] flex items-center gap-1">
                      <Layers className="h-3 w-3 text-primary" /> Batches in Dept
                    </span>
                    {role === "admin" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] text-primary hover:text-primary font-bold px-1.5 py-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateBatchForDept(d);
                        }}
                      >
                        + Add Batch
                      </Button>
                    )}
                  </div>

                  {deptBatches.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {deptBatches.map((b) => (
                        <Badge
                          key={b.id || b.batchCode}
                          variant="outline"
                          className="font-mono text-[10px] bg-background text-primary border-primary/20"
                        >
                          {b.batchCode}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">
                      No batches created under this department yet.
                    </p>
                  )}
                </div>

                {/* Attendance Progress */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium text-[11px]">
                      Attendance Rate
                    </span>
                    <span className="font-bold font-mono text-foreground">{pct}%</span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 rounded-full ${
                      isHigh
                        ? "[&>div]:bg-emerald-600"
                        : isMedium
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-rose-500"
                    }`}
                  />
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[11px]">
                  <span className="text-muted-foreground truncate">
                    {d.hodName ? (
                      <>
                        HOD: <strong className="text-foreground">{d.hodName}</strong>
                      </>
                    ) : (
                      "Department Lead"
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      className={`text-[9px] font-bold uppercase border-none px-2 py-0.5 ${
                        isHigh
                          ? "bg-emerald-500/10 text-emerald-600"
                          : isMedium
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-rose-500/10 text-rose-600"
                      }`}
                    >
                      {isHigh ? "EXCELLENT" : isMedium ? "GOOD" : "ATTENTION"}
                    </Badge>
                    {role === "admin" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDepartment(d.departmentId, d.departmentName);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* DEPARTMENT COMPARISON CHART / VISUAL STRIP */}
      <Card className="border-border/60 p-4 shadow-xs">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Department Attendance Comparison
          </CardTitle>
          <CardDescription className="text-xs">
            Relative comparison of student attendance rates and batches across all academic units.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-3">
          {departmentsData.map((d) => {
            const pct = d.attendancePercentage || 0;
            return (
              <div key={`comp-${d.departmentCode}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{d.departmentName}</span>
                    <Badge variant="outline" className="text-[9px] font-mono py-0 px-1.5">
                      {d.departmentCode}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-muted-foreground">
                      {d.presentCount} / {d.totalStudents} present
                    </span>
                    <span className="font-bold text-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 85 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* DEPARTMENT-WISE STUDENT ATTENDANCE ROSTER TABLE */}
      <Card className="border-border/60 p-4 shadow-xs">
        <CardHeader className="px-0 pt-0 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Department-Wise Student Attendance
              Roster
            </CardTitle>
            <CardDescription className="text-xs">
              Live roster of registered students, department affiliation, session timing, and
              real-time marked status.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter Tabs */}
            <div className="flex items-center bg-muted p-1 rounded-xl text-xs overflow-x-auto">
              <button
                onClick={() => setSelectedDeptFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedDeptFilter === "ALL"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Depts
              </button>
              {departmentsData.map((d) => (
                <button
                  key={d.departmentCode}
                  onClick={() => setSelectedDeptFilter(d.departmentName)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedDeptFilter === d.departmentName
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.departmentCode}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 text-xs bg-background border border-border rounded-lg px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
            </select>
          </div>
        </CardHeader>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student by name, USN, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-10 text-center text-xs text-muted-foreground animate-pulse">
            Loading department attendance data...
          </div>
        ) : filteredRoster.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Student Name</TableHead>
                  <TableHead className="text-xs">USN / ID</TableHead>
                  <TableHead className="text-xs">Department</TableHead>
                  <TableHead className="text-xs">Subject / Session</TableHead>
                  <TableHead className="text-xs">Marked Time</TableHead>
                  <TableHead className="text-right text-xs">Today's Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoster.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div>{item.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      {item.usn}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold bg-muted/50 border-border"
                      >
                        {item.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.subjectName}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {item.markedTime}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={`text-[10px] font-bold ${
                          item.isPresent
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-rose-600 hover:bg-rose-700 text-white"
                        }`}
                      >
                        {item.isPresent ? "PRESENT ✓" : "ABSENT ✕"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-10 text-center space-y-2">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <div className="text-sm font-medium">No Students or Attendance Records Found</div>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or department filter.
            </p>
          </div>
        )}
      </Card>

      {/* CREATE DEPARTMENT MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Building2 className="h-5 w-5 text-primary" /> Add New Academic Department
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure a new academic department, code, Head of Department, and building wing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDepartment} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Department Full Name</Label>
              <Input
                required
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="Enter department name"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Department Code</Label>
                <Input
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="Enter Department code"
                  className="h-9 text-xs font-mono uppercase font-bold"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Building Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter department location"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Head of Department (HOD)</Label>
              <Input
                value={hodName}
                onChange={(e) => setHodName(e.target.value)}
                placeholder="Enter department head"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description "
                className="h-9 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creatingDept}
                className="text-xs font-semibold"
              >
                {creatingDept ? "Creating..." : "Save Department"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE BATCH DIRECTLY UNDER DEPARTMENT MODAL */}
      <Dialog open={showCreateBatchModal} onOpenChange={setShowCreateBatchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Layers className="h-5 w-5 text-primary" /> Create Batch Under Department
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create and assign a new batch code directly under this academic department.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatchUnderDept} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Academic Department
              </Label>
              <select
                required
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full h-9 text-xs bg-background border border-border rounded-md px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                {departmentsData.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName} ({d.departmentCode})
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
                <Label className="text-xs font-semibold">Batch Full Name</Label>
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
                  placeholder="Enter your subject"
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
                onClick={() => setShowCreateBatchModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creatingBatch}
                className="text-xs font-semibold"
              >
                {creatingBatch ? "Creating..." : "Save Batch in Department"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
