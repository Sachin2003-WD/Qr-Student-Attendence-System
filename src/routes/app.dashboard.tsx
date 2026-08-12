import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarCheck, TrendingUp, CheckCircle2, QrCode, Users,
  AlertCircle, RefreshCw, FileText, BookOpen, Clock, Layers
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import {
  api, TODAY_SUBJECT_SESSIONS, getRealtimeSubjectSessions, type AttendanceResponse,
  type AttendanceSummaryResponse, type QRCodeResponse
} from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Attendance System" },
      { name: "description", content: "Your live attendance overview." },
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
            ? "Here is your subject-wise attendance status and today's sessions."
            : "Institution-wide batch management, attendance analytics, and QR engine."
        }
        actions={
          role === "student" ? (
            <Link to="/app/attendance">
              <Button className="gap-2 text-xs font-semibold">
                <QrCode className="h-4 w-4" /> Scan Session QR
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
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const activeSessions = getRealtimeSubjectSessions();

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [sum, qr] = await Promise.all([
        api.getMyAttendanceSummary().catch(() => null),
        api.getDynamicStudentQRCode().catch(() => null),
      ]);
      if (sum) setSummary(sum);
      if (qr) setQrData(qr);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
    const interval = setInterval(() => {
      api.getMyAttendanceSummary().then((s) => setSummary(s)).catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 120-second (2 minutes) dynamic QR auto-rotation timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      api.getDynamicStudentQRCode().then((qr) => {
        setQrData(qr);
        setSecondsLeft(120);
      }).catch(() => {});
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sessions" value={summary?.totalDays ?? 0} icon={CalendarCheck} />
        <StatCard label="Present Count" value={summary?.presentCount ?? 0} icon={CheckCircle2} accent="chart-2" />
        <StatCard label="Absent Count" value={summary?.absentCount ?? 0} icon={AlertCircle} accent="chart-4" />
        <StatCard label="Attendance %" value={`${(summary?.attendancePercentage ?? 0).toFixed(1)}%`} icon={TrendingUp} accent="chart-3" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Subject Sessions (Realtime from Active Batches) */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Today's Subject Sessions (Realtime)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Live Realtime
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {activeSessions.map((s: any, idx: number) => (
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
                  <Badge variant="outline" className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                    {s.code}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono font-medium"><Clock className="h-3.5 w-3.5 text-primary" /> {s.time}</span>
                  <span>• {s.faculty}</span>
                  <span>• {s.room}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Personal Student Dynamic QR Code Showcase Card */}
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardHeader className="pb-2 text-center border-b border-primary/10">
            <CardTitle className="text-base font-bold flex items-center justify-center gap-2 text-primary">
              <QrCode className="h-5 w-5" /> Your Personal Student Dynamic QR Code
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Displays your live dynamic token for camera scanning by Admin / Faculty.
            </p>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center text-center space-y-3">
            {qrData?.qrCodeBase64 ? (
              <div className="rounded-2xl border bg-white p-4 shadow-md border-primary/20">
                <img src={qrData.qrCodeBase64} alt="Student Dynamic QR" className="h-52 w-52 object-contain" />
              </div>
            ) : (
              <div className="grid h-52 w-52 place-items-center rounded-2xl border bg-card text-xs">Loading Live QR...</div>
            )}
            <span className="text-xs font-mono font-bold bg-background px-3.5 py-1.5 rounded-md border border-border text-foreground shadow-xs">
              {qrData?.token || "Generating..."}
            </span>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-primary animate-spin" /> Dynamic token refreshes automatically in <strong>{minutesDisplay}m {secondsDisplay}s</strong>
            </p>
            <Link to="/app/attendance" className="w-full pt-1">
              <Button size="sm" className="w-full text-xs font-bold gap-2">
                <QrCode className="h-4 w-4" /> Open Fullscreen QR Scanner
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Attendance History</CardTitle>
          <Button size="icon" variant="ghost" onClick={loadStudentData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">Loading...</div>
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
                      <TableCell className="text-xs font-medium">{r.subjectCode || "—"} - {r.subjectName || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] font-bold ${
                          r.status === "PRESENT" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                        }`}>
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
              <div className="mt-2 text-sm font-medium">No Attendance Recorded Yet</div>
              <p className="mt-1 text-xs text-muted-foreground">Scan a session QR code or use the token entry above.</p>
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
  const [loadingBatches, setLoadingBatches] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoadingBatches(true);
      const [batchData, repData] = await Promise.all([
        api.getBatches().catch(() => []),
        api.getAttendanceReport().catch(() => []),
      ]);
      setBatches(batchData || []);
      setRecords(repData || []);
    } catch {
      // silent
    } finally {
      setLoadingBatches(false);
    }
  };

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const overallPct = records.length > 0 ? ((presentCount / records.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Batches Created" value={batches.length} icon={Layers} />
        <StatCard label="Attendance Logs" value={records.length} icon={Users} accent="chart-2" />
        <StatCard label="Active Sessions" value={TODAY_SUBJECT_SESSIONS.length} icon={BookOpen} accent="chart-3" />
        <StatCard label="Overall Present %" value={`${overallPct}%`} icon={TrendingUp} accent="chart-4" />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Link to="/app/batches">
          <Card className="p-4 border-border/60 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">Manage Batches</div>
                <div className="text-xs text-muted-foreground truncate">Create & configure batch codes</div>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/app/attendance">
          <Card className="p-4 border-border/60 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">Attendance Scanner</div>
                <div className="text-xs text-muted-foreground truncate">QR scanner & session control</div>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/app/calendar">
          <Card className="p-4 border-border/60 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">Calendar View</div>
                <div className="text-xs text-muted-foreground truncate">Date-wise attendance report</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Created Batches Overview */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Created Batches Overview
          </CardTitle>
          <Button size="icon" variant="ghost" onClick={loadAdminData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingBatches ? (
            <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">Loading batches...</div>
          ) : batches.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {batches.slice(0, 6).map((b: any, idx: number) => (
                <div key={b.id || idx} className="rounded-xl border border-border/60 p-3.5 space-y-2 hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/20 break-all">
                      {b.batchCode || b.name}
                    </Badge>
                    <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none shrink-0">ACTIVE</Badge>
                  </div>
                  <div className="text-xs font-semibold break-words">{b.subjectName || "Subject"}</div>
                  <div className="text-[11px] text-muted-foreground break-words">{b.branch || "Branch"} • {b.trainerName || "Trainer"}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{b.classTiming || "—"} • {b.startDate || "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="text-sm font-medium">No Batches Created Yet</div>
              <p className="text-xs text-muted-foreground">Go to Batches section to create your first batch code.</p>
              <Link to="/app/batches">
                <Button size="sm" className="text-xs font-semibold mt-2">Create First Batch</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System-Wide Attendance Activity */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">System-Wide Attendance Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[550px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Date & Time</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-medium">{r.userName || r.userEmail}</TableCell>
                      <TableCell className="text-xs font-mono">{r.subjectCode || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {r.date} {r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] font-bold ${r.status === "PRESENT" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
              No system-wide attendance activity recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
