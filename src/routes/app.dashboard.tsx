import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  QrCode,
  Users,
  AlertCircle,
  RefreshCw,
  FileText,
  BookOpen,
  Clock,
  Layers,
  Building2,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import {
  api,
  getRealtimeSubjectSessions,
  getDailyTokenForSubject,
  getDailyStudentToken,
  type AttendanceResponse,
  type AttendanceSummaryResponse,
  type QRCodeResponse,
} from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Attendance System" },
      { name: "description", content: "Your live attendance overview with daily rotating compact QR tokens." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role, userName } = useApp();
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName.split(" ")[0] || "User"}`}
        subtitle={
          role === "student"
            ? "Here is your subject-wise attendance status, active sessions, and today's dynamic QR token."
            : "Institution-wide batch management, department metrics, and daily rotating QR engine."
        }
        actions={
          role === "student" ? (
            <Link to="/app/attendance">
              <Button className="gap-2 text-xs font-semibold">
                <QrCode className="h-4 w-4" /> Present Student QR
              </Button>
            </Link>
          ) : (
            <Link to="/app/attendance">
              <Button className="gap-2 text-xs font-semibold">
                <QrCode className="h-4 w-4" /> Attendance Scanner
              </Button>
            </Link>
          )
        }
      />

      {role === "student" && <StudentLiveDash />}
      {role === "admin" && <AdminLiveDash />}
    </div>
  );
}

/* ============================================================
   STUDENT DASHBOARD
   ============================================================ */
function StudentLiveDash() {
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [sum, batches] = await Promise.all([
        api.getMyAttendanceSummary().catch(() => null),
        api.getBatches().catch(() => []),
      ]);
      if (sum) setSummary(sum);

      if (batches && batches.length > 0) {
        const formatted = batches.map((b: any, idx: number) => ({
          code: b.batchCode || b.name || `BATCH-0${idx + 1}`,
          name: b.subjectName || b.name || "Subject Session",
          time: b.classTiming || "09:00 AM",
          faculty: b.trainerName || "Faculty Trainer",
          room: b.branch || "Main Campus",
          token: getDailyTokenForSubject(b.batchCode || b.name || "B01"),
        }));
        setActiveSessions(formatted);
      } else {
        setActiveSessions(getRealtimeSubjectSessions());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
    const interval = setInterval(() => {
      api
        .getMyAttendanceSummary()
        .then((s) => setSummary(s))
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sessions" value={summary?.totalDays ?? 0} icon={CalendarCheck} />
        <StatCard
          label="Present Count"
          value={summary?.presentCount ?? 0}
          icon={CheckCircle2}
          accent="chart-2"
        />
        <StatCard
          label="Absent Count"
          value={summary?.absentCount ?? 0}
          icon={AlertCircle}
          accent="chart-4"
        />
        <StatCard
          label="Attendance %"
          value={`${(summary?.attendancePercentage ?? 0).toFixed(1)}%`}
          icon={TrendingUp}
          accent="chart-3"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Today's Subject Sessions */}
        <Card className="lg:col-span-7 border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Today's Active Sessions ({currentDateStr})
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              >
                Daily Tokens Active
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Subject sessions with compact daily tokens rotating automatically each day.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {activeSessions.length > 0 ? (
              activeSessions.map((s: any, idx: number) => (
                <div
                  key={s.code || idx}
                  onClick={() => setSelectedSubject(s.code)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedSubject === s.code
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-foreground">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/20"
                      >
                        {s.code}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                        {s.token}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {s.time}
                    </span>
                    <span>• {s.faculty}</span>
                    <span>• {s.room}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <div className="text-sm font-medium">No Scheduled Sessions Available</div>
                <p className="text-xs text-muted-foreground">
                  Active academic batch sessions will appear here once configured by Faculty/Admin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Status & Quick Actions Card */}
        <Card className="lg:col-span-5 border-border/60 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between mb-1">
              <Badge className="bg-primary text-primary-foreground font-mono text-[9px] uppercase font-bold">
                Student Status
              </Badge>
              <Badge variant="outline" className="text-[9px] font-mono text-emerald-600 border-emerald-500/30">
                {currentDateStr}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Academic Standing & Criteria
            </CardTitle>
            <CardDescription className="text-xs">
              Minimum 75% attendance is required across all subjects for examination eligibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Overall Attendance:</span>
                <span className="font-bold font-mono text-sm text-foreground">
                  {(summary?.attendancePercentage ?? 0).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={summary?.attendancePercentage ?? 0}
                className={`h-2.5 rounded-full ${
                  (summary?.attendancePercentage ?? 0) >= 85
                    ? "[&>div]:bg-emerald-600"
                    : (summary?.attendancePercentage ?? 0) >= 75
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-rose-500"
                }`}
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>75% Minimum Target</span>
                <span className="font-semibold text-emerald-600">
                  {(summary?.attendancePercentage ?? 0) >= 75 ? "Target Achieved ✓" : "Shortage Warning ⚠"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">Present Days</span>
                <span className="text-base font-bold text-emerald-600 font-mono">
                  {summary?.presentCount ?? 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">Absent Days</span>
                <span className="text-base font-bold text-rose-600 font-mono">
                  {summary?.absentCount ?? 0}
                </span>
              </div>
            </div>

            <Link to="/app/attendance" className="block pt-1">
              <Button size="sm" className="w-full text-xs font-bold gap-2">
                <CheckCircle2 className="h-4 w-4" /> Open Attendance Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Attendance History</CardTitle>
            <CardDescription className="text-xs">Your verified session attendance logs.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading...
            </div>
          ) : summary?.records && summary.records.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.records.slice(0, 8).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-mono">{r.date}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {r.subjectCode || "—"} - {r.subjectName || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] font-bold ${
                            r.status === "PRESENT"
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                          }`}
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <QrCode className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="mt-2 text-sm font-medium">No Attendance Recorded Yet Today</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Present your daily student dynamic QR code to the instructor's camera scanner.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function AdminLiveDash() {
  const [batches, setBatches] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [departmentsData, setDepartmentsData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadAdminData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingData(true);
      const [batchData, repData, deptData, studentsData] = await Promise.all([
        api.getBatches().catch(() => []),
        api.getAttendanceReport().catch(() => []),
        api.getDepartmentWiseAttendance().catch(() => []),
        api.getStudents().catch(() => []),
      ]);
      setBatches(batchData || []);
      setRecords(repData || []);
      setDepartmentsData(deptData || []);
      setStudents(studentsData || []);
    } catch {
      // silent
    } finally {
      if (!silent) setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadAdminData]);

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const overallPct =
    records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Batches Created" value={batches.length} icon={Layers} />
        <StatCard label="Attendance Logs" value={records.length} icon={Users} accent="chart-2" />
        <StatCard
          label="Active Departments"
          value={departmentsData.length}
          icon={Building2}
          accent="chart-3"
        />
        <StatCard
          label="Overall Present %"
          value={`${overallPct}%`}
          icon={TrendingUp}
          accent="chart-4"
        />
      </div>

      {/* ADMIN QUICK ACCESS ACTION CARDS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/app/attendance">
          <Card className="p-4 border-border/60 hover:border-primary/50 transition-all cursor-pointer group bg-card shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                  Camera QR Scanner
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Start session & auto-scan
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-primary gap-1">
              Launch Scanner <ArrowRight className="h-3 w-3" />
            </div>
          </Card>
        </Link>

        <Link to="/app/reports">
          <Card className="p-4 border-border/60 hover:border-primary/50 transition-all cursor-pointer group bg-card shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate group-hover:text-emerald-600 transition-colors">
                  Department Reports
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Attendance analysis & export
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-emerald-600 gap-1">
              View Analytics <ArrowRight className="h-3 w-3" />
            </div>
          </Card>
        </Link>

        <Link to="/app/departments">
          <Card className="p-4 border-border/60 hover:border-primary/50 transition-all cursor-pointer group bg-card shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate group-hover:text-purple-600 transition-colors">
                  Department Units
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Manage academic branches
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-purple-600 gap-1">
              Configure Units <ArrowRight className="h-3 w-3" />
            </div>
          </Card>
        </Link>

        <Link to="/app/batches">
          <Card className="p-4 border-border/60 hover:border-primary/50 transition-all cursor-pointer group bg-card shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate group-hover:text-amber-600 transition-colors">
                  Batch Roster
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Assign trainers & codes
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] font-semibold text-amber-600 gap-1">
              Manage Batches <ArrowRight className="h-3 w-3" />
            </div>
          </Card>
        </Link>
      </div>

      {/* DEPARTMENT SECTION FEATURES & LIVE ATTENDANCE OVERVIEW */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Department Section Features & Live Attendance
            </CardTitle>
            <CardDescription className="text-xs">
              Live attendance performance, student coverage, and academic metrics across departments.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/app/departments">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
                Open Department Section <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingData ? (
            <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
              Loading department attendance features...
            </div>
          ) : departmentsData.length > 0 ? (
            <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {departmentsData.slice(0, 6).map((d: any, idx: number) => {
                const pct = d.attendancePercentage || 0;
                const isHigh = pct >= 85;
                const isMedium = pct >= 70 && pct < 85;

                return (
                  <Link
                    to="/app/departments"
                    key={d.departmentId || d.departmentCode || idx}
                    className="block group"
                  >
                    <div className="rounded-xl border border-border/60 p-3.5 space-y-2.5 hover:border-primary/40 hover:bg-muted/30 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {d.departmentName}
                            </div>
                            {d.hodName && (
                              <div className="text-[10px] text-muted-foreground truncate">
                                HOD: {d.hodName}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] font-bold bg-muted text-foreground shrink-0"
                        >
                          {d.departmentCode}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono pt-1">
                        <span className="text-muted-foreground text-[11px]">
                          {d.presentCount} / {d.totalStudents} present
                        </span>
                        <span className="font-bold text-foreground">{pct}%</span>
                      </div>

                      <Progress
                        value={pct}
                        className={`h-1.5 rounded-full ${
                          isHigh
                            ? "[&>div]:bg-emerald-600"
                            : isMedium
                              ? "[&>div]:bg-amber-500"
                              : "[&>div]:bg-rose-500"
                        }`}
                      />

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span className="text-muted-foreground truncate">{d.location || "Academic Wing"}</span>
                        <Badge
                          className={`text-[9px] font-bold border-none px-1.5 py-0 ${
                            isHigh
                              ? "bg-emerald-500/10 text-emerald-600"
                              : isMedium
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {isHigh ? "EXCELLENT" : isMedium ? "GOOD" : "ATTENTION"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
              <Building2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="text-sm font-medium">No Departments Configured</div>
              <p className="text-xs text-muted-foreground">
                Set up academic departments to view department-wise attendance.
              </p>
              <Link to="/app/departments">
                <Button size="sm" className="text-xs font-semibold mt-2">
                  Go to Department Section
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Created Batches Overview */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Created Batches & Daily Codes
            </CardTitle>
            <CardDescription className="text-xs">Active batch units and assigned daily session tokens.</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={() => loadAdminData(false)}>
            <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
              Loading batches...
            </div>
          ) : batches.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {batches.slice(0, 6).map((b: any, idx: number) => {
                const bToken = getDailyTokenForSubject(b.batchCode || b.name || "B01");
                return (
                  <div
                    key={b.id || idx}
                    className="rounded-xl border border-border/60 p-3.5 space-y-2 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/20 break-all"
                      >
                        {b.batchCode || b.name}
                      </Badge>
                      <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                        {bToken}
                      </span>
                    </div>
                    <div className="text-xs font-semibold break-words">
                      {b.subjectName || "Subject"}
                    </div>
                    <div className="text-[11px] text-muted-foreground break-words">
                      {b.departmentName || "General Dept"} • {b.trainerName || "Trainer"}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {b.classTiming || "—"} • {b.branch || "Main Campus"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="text-sm font-medium">No Batches Created Yet</div>
              <p className="text-xs text-muted-foreground">
                Go to Batches section to create your first batch code.
              </p>
              <Link to="/app/batches">
                <Button size="sm" className="text-xs font-semibold mt-2">
                  Create First Batch
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
