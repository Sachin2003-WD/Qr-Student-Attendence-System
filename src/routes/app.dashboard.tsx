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
  Camera,
  FlaskConical,
  GraduationCap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  getDailyStudentToken,
  type AttendanceResponse,
  type AttendanceSummaryResponse,
} from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Attendance System" },
      { name: "description", content: "Live attendance overview, batch management, and QR status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role, userName } = useApp();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName ? userName.split(" ")[0] : role === "admin" ? "Admin" : "Student"}!`}
        subtitle={`Today is ${today}. Here is your quick attendance overview and daily actions.`}
        actions={
          role === "student" ? (
            <Link to="/app/attendance">
              <Button className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <QrCode className="h-4 w-4" /> Show My QR Code
              </Button>
            </Link>
          ) : (
            <Link to="/app/attendance">
              <Button className="gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Camera className="h-4 w-4" /> Take Attendance (Camera)
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
   STUDENT DASHBOARD (CLEAN & SIMPLE)
   ============================================================ */
function StudentLiveDash() {
  const { userName, userEmail } = useApp();
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [studentToken, setStudentToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const sum = await api.getMyAttendanceSummary().catch(() => null);
      if (sum) setSummary(sum);
      setStudentToken(getDailyStudentToken());
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyToken = () => {
    if (!studentToken) return;
    navigator.clipboard.writeText(studentToken);
    setCopied(true);
    toast.success("Copied your attendance QR token!");
    setTimeout(() => setCopied(false), 2000);
  };

  const attendancePct = summary?.attendancePercentage ?? 0;
  const isEligible = attendancePct >= 75;

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS IN PLAIN ENGLISH */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance Percentage */}
        <Card className={`p-4 border shadow-xs ${isEligible ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">My Attendance Rate</span>
            <TrendingUp className={`h-4 w-4 ${isEligible ? "text-emerald-600" : "text-amber-600"}`} />
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${isEligible ? "text-emerald-600" : "text-amber-600"}`}>
            {attendancePct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            {isEligible ? "✅ Exam Eligible (Target ≥75%)" : "⚠️ Needs improvement (Target: 75%)"}
          </div>
        </Card>

        {/* Total Classes */}
        <Card className="p-4 border border-border/60 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Classes Held</span>
            <CalendarCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {summary?.totalDays ?? 0} Classes
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Recorded by teachers</div>
        </Card>

        {/* Present Count */}
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Classes Attended</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {summary?.presentCount ?? 0} Present
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Verified check-ins</div>
        </Card>

        {/* Absent Count */}
        <Card className="p-4 border border-rose-500/30 bg-rose-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Classes Missed</span>
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
            {summary?.absentCount ?? 0} Absent
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Unexcused / Missed</div>
        </Card>
      </div>

      {/* 2. ATTENDANCE PROGRESS & STUDENT QR BANNER */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Left: Attendance Progress Overview */}
        <Card className="lg:col-span-7 border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> My Attendance Standing
            </CardTitle>
            <CardDescription className="text-xs">
              Universities require a minimum of 75% attendance to sit for final semester exams.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Overall Academic Presence:</span>
                <span className="font-mono text-sm font-bold text-primary">{attendancePct.toFixed(1)}%</span>
              </div>
              <Progress
                value={attendancePct}
                className={`h-3 rounded-full ${isEligible ? "[&>div]:bg-emerald-600" : "[&>div]:bg-amber-500"}`}
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span>0%</span>
                <span className="font-bold text-primary">75% Exam Minimum</span>
                <span>100%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">{userName || "Enrolled Student"}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{userEmail}</span>
              </div>
              <Badge variant="outline" className="font-mono text-xs font-bold bg-background text-emerald-600 border-emerald-500/30">
                Active Student
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link to="/app/attendance">
                <Button className="w-full text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <QrCode className="h-4 w-4" /> Open Full QR Screen
                </Button>
              </Link>
              <Link to="/app/labs">
                <Button variant="outline" className="w-full text-xs font-bold gap-2">
                  <FlaskConical className="h-4 w-4 text-purple-600" /> Lab Attendance
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right: Quick QR Token Card */}
        <Card className="lg:col-span-5 border-border/60 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" /> Today's QR Token
              </CardTitle>
              <Badge className="bg-emerald-600 text-white font-mono text-[9px]">LIVE TODAY</Badge>
            </div>
            <CardDescription className="text-xs">
              Show this token to your instructor or camera scanner at the door.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="p-3 bg-muted/30 rounded-xl border border-border/80 w-full flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">My Dynamic Code:</span>
              <strong className="text-sm text-primary font-bold">{studentToken || "S16-ACTIVE-01"}</strong>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToken}
              className="w-full text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied to Clipboard!" : "Copy Token Code"}
            </Button>

            <p className="text-[11px] text-muted-foreground">
              Tip: The code updates automatically every calendar day to protect against proxy attendance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. RECENT ATTENDANCE HISTORY TABLE */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Recent Verified Classes
            </CardTitle>
            <CardDescription className="text-xs">Your verified attendance history.</CardDescription>
          </div>
          <Button size="icon" variant="ghost" onClick={loadStudentData}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
              Loading attendance history...
            </div>
          ) : summary?.records && summary.records.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Date</TableHead>
                    <TableHead className="text-xs font-bold">Subject / Class</TableHead>
                    <TableHead className="text-xs font-bold">Check-in Time</TableHead>
                    <TableHead className="text-xs font-bold">Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.records.slice(0, 6).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-mono">{r.date}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {r.subjectCode || "Class"} {r.subjectName ? `— ${r.subjectName}` : ""}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Verified"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] font-bold ${
                            r.status === "PRESENT"
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-600 text-white"
                          }`}
                        >
                          {r.status === "PRESENT" ? "✓ Present" : "Absent"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
              <QrCode className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="text-sm font-medium">No Attendance Recorded Today Yet</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When you enter your classroom, present your QR code to the instructor's camera scanner.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD (CLEAN, SIMPLE, INTUITIVE)
   ============================================================ */
function AdminLiveDash() {
  const [batches, setBatches] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const loadAdminData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingData(true);
      const [batchData, repData, studentsData, labsData] = await Promise.all([
        api.getBatches().catch(() => []),
        api.getAttendanceReport().catch(() => []),
        api.getStudents().catch(() => []),
        api.getLabs().catch(() => []),
      ]);
      setBatches(batchData || []);
      setRecords(repData || []);
      setStudents(studentsData || []);
      setLabs(labsData || []);
    } finally {
      if (!silent) setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(() => {
      loadAdminData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadAdminData]);

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const overallPct =
    records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* 1. FOUR CORE HIGH-LEVEL STATS */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Registered Students */}
        <Card className="p-4 border border-border/60 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Registered Students</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {students.length} Students
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Enrolled student profiles</div>
        </Card>

        {/* Active Batches / Classes */}
        <Card className="p-4 border border-border/60 bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Batches</span>
            <Layers className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-foreground">
            {batches.length} Batches
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Configured classes</div>
        </Card>

        {/* Overall Attendance Rate */}
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Campus Attendance Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {overallPct}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{presentCount} verified check-ins</div>
        </Card>

        {/* Practical Labs */}
        <Card className="p-4 border border-purple-500/30 bg-purple-500/5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Practical Labs</span>
            <FlaskConical className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono mt-1 text-purple-600 dark:text-purple-400">
            {labs.length} Labs
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Practical lab units</div>
        </Card>
      </div>

      {/* 2. SIMPLE, OBVIOUS QUICK ACTIONS (4 LARGE FRIENDLY TILES) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Administrative Actions
        </h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/app/attendance">
            <Card className="p-4 border-border/70 hover:border-primary/60 transition-all cursor-pointer group bg-card shadow-xs hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Camera Scanner
                  </div>
                  <p className="text-[11px] text-muted-foreground">Scan student QR codes</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/app/labs">
            <Card className="p-4 border-border/70 hover:border-purple-500/60 transition-all cursor-pointer group bg-card shadow-xs hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-purple-600 transition-colors">
                    Practical Labs
                  </div>
                  <p className="text-[11px] text-muted-foreground">Mark lab attendance & grades</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/app/students">
            <Card className="p-4 border-border/70 hover:border-emerald-500/60 transition-all cursor-pointer group bg-card shadow-xs hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    Student Roster
                  </div>
                  <p className="text-[11px] text-muted-foreground">Manage enrolled students</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/app/reports">
            <Card className="p-4 border-border/70 hover:border-blue-500/60 transition-all cursor-pointer group bg-card shadow-xs hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                    Official Reports
                  </div>
                  <p className="text-[11px] text-muted-foreground">Export PDF & Excel sheets</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* 3. ACTIVE CLASSES / BATCHES & RECENT LOGS */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Left: Active Batches */}
        <Card className="lg:col-span-6 border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Active Class Batches
              </CardTitle>
              <CardDescription className="text-xs">Classes currently taking attendance.</CardDescription>
            </div>
            <Link to="/app/batches">
              <Button size="sm" variant="ghost" className="text-xs text-primary font-semibold gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {batches.length > 0 ? (
              batches.slice(0, 4).map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2">
                      <span>{b.batchCode || b.name}</span>
                      <Badge variant="outline" className="font-mono text-[9px] bg-background">
                        {b.subjectName || "Subject"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-[11px] pt-0.5">
                      {b.trainerName || "Faculty"} • {b.classTiming || "Regular Schedule"}
                    </div>
                  </div>
                  <Link to="/app/attendance">
                    <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 font-semibold">
                      Scan
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-xl border border-dashed text-center text-xs text-muted-foreground space-y-2">
                <p>No batches created yet.</p>
                <Link to="/app/batches">
                  <Button size="sm" className="text-xs font-bold">
                    Create First Batch
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Recent Student Presence Logs */}
        <Card className="lg:col-span-6 border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Recent Attendance Logs
              </CardTitle>
              <CardDescription className="text-xs">Live check-ins verified by camera or manual entry.</CardDescription>
            </div>
            <Link to="/app/reports">
              <Button size="sm" variant="ghost" className="text-xs text-emerald-600 font-semibold gap-1">
                Full Logbook <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {records.length > 0 ? (
              <div className="space-y-2">
                {records.slice(0, 4).map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-foreground">{r.studentName || "Student"}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {r.usn || "USN"} • {r.date}
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      ✓ Present
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed text-center text-xs text-muted-foreground space-y-2">
                <p>No attendance logs recorded yet today.</p>
                <Link to="/app/attendance">
                  <Button size="sm" className="text-xs font-bold gap-1.5">
                    <Camera className="h-3.5 w-3.5" /> Start Taking Attendance
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
