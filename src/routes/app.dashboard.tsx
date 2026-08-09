import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarCheck, CalendarClock, TrendingUp, CheckCircle2, QrCode, Scan, Users,
  AlertCircle, RefreshCw, FileText, BookOpen, Clock, AlertTriangle
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
  api, TODAY_SUBJECT_SESSIONS, type QRCodeResponse, type AttendanceResponse,
  type AttendanceSummaryResponse, type SubjectSession
} from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Attendance System" },
      { name: "description", content: "Your live attendance overview: daily sessions, subject QR codes, and reports." },
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
            ? "Here is your subject-wise lecture schedule & live attendance status for today."
            : role === "faculty"
            ? "Your classroom QR projector, subject attendance, and session scanner overview."
            : "Institution-wide attendance analytics, subject reports, and QR engine."
        }
        actions={
          role === "student" ? (
            <Link to="/app/attendance">
              <Button className="gap-2">
                <QrCode className="h-4 w-4" /> Scan Classroom QR
              </Button>
            </Link>
          ) : role === "admin" ? (
            <Link to="/app/attendance">
              <Button className="gap-2">
                <FileText className="h-4 w-4" /> Export Reports
              </Button>
            </Link>
          ) : undefined
        }
      />

      {role === "student" && <StudentLiveDash />}
      {role === "faculty" && <FacultyLiveDash />}
      {role === "admin" && <AdminLiveDash />}
    </div>
  );
}

function StudentLiveDash() {
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("CS301");
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const sum = await api.getMyAttendanceSummary();
      setSummary(sum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const handleMarkAttendance = async (tokenToUse?: string, subjCode?: string) => {
    const targetToken = (tokenToUse || manualToken).trim();
    const targetSubj = subjCode || selectedSubject;

    if (!targetToken) {
      toast.error("Please enter or scan a valid QR token.");
      return;
    }

    setMarking(true);
    try {
      const res = await api.markAttendance(targetToken, targetSubj);
      toast.success(`Attendance marked ${res.status} for ${res.subjectName || targetSubj}!`);
      setManualToken("");
      loadStudentData();
    } catch (err: any) {
      toast.error(err.message || "Invalid QR Token! Attendance rejected.");
    } finally {
      setMarking(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = summary?.records?.filter((r) => r.date === todayStr) || [];

  return (
    <div className="space-y-6">
      {/* Attendance Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall Attendance %" value={`${summary?.attendancePercentage ?? 0}%`} icon={TrendingUp} accent="chart-2" />
        <StatCard label="Present Sessions" value={summary?.presentCount ?? 0} icon={CheckCircle2} accent="chart-3" />
        <StatCard label="Late Sessions" value={summary?.lateCount ?? 0} icon={CalendarClock} accent="chart-4" />
        <StatCard label="Total Marked Sessions" value={summary?.records?.length ?? 0} icon={CalendarCheck} />
      </div>

      {/* Multi-Session Daily Timetable Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Today's Lecture Sessions ({todayStr})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Colleges conduct multiple subject sessions per day. Mark attendance for each subject lecture using classroom QR tokens.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={loadStudentData} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {TODAY_SUBJECT_SESSIONS.map((session) => {
              const record = todayRecords.find((r) => r.subjectCode === session.code);
              const isMarked = !!record;

              return (
                <div
                  key={session.code}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition ${
                    isMarked
                      ? record.status === "PRESENT"
                        ? "border-green-500/40 bg-green-500/5"
                        : "border-amber-500/40 bg-amber-500/5"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {session.code}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {session.time}
                        </span>
                      </div>
                      <h4 className="mt-1 font-semibold text-sm">{session.name}</h4>
                      <p className="text-xs text-muted-foreground">{session.faculty} • {session.room}</p>
                    </div>

                    {isMarked ? (
                      <Badge variant={record.status === "PRESENT" ? "default" : "secondary"} className="shrink-0">
                        {record.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300 bg-amber-50">
                        Pending
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground">
                      {isMarked
                        ? `Marked at ${new Date(record.markedAt).toLocaleTimeString()}`
                        : "Requires classroom QR code token"}
                    </span>
                    {!isMarked && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setSelectedSubject(session.code);
                          handleMarkAttendance(session.token, session.code);
                        }}
                      >
                        <QrCode className="h-3 w-3" /> Mark Session
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Manual Token Verification Box */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" /> Enter Classroom QR Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Enter the active session token projected on your classroom screen. Wrong or expired tokens will be strictly rejected.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleMarkAttendance();
            }}
          >
            <Input
              placeholder="e.g. DAILY_CLASSROOM_TOKEN_CS301"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="bg-background"
            />
            <Button type="submit" disabled={marking} className="sm:shrink-0 gap-1">
              {marking ? "Validating..." : "Submit Token"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Attendance Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Subject Attendance History</CardTitle>
          <Link to="/app/calendar" className="text-xs text-primary hover:underline">
            View in Calendar
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading attendance history...</div>
          ) : summary?.records && summary.records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject Code & Name</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.records.slice(0, 8).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.date}</TableCell>
                    <TableCell>
                      <div className="font-medium text-xs">{r.subjectCode || "CS301"}</div>
                      <div className="text-[11px] text-muted-foreground">{r.subjectName || "Data Structures"}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.sessionTime || (r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : "-")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "PRESENT" ? "default" : "secondary"}>{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <QrCode className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <div className="mt-2 text-sm font-medium">No Attendance Recorded Yet</div>
              <p className="mt-1 text-xs text-muted-foreground">Use the Mark Session buttons above to log lecture attendance.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FacultyLiveDash() {
  const [selectedSubj, setSelectedSubj] = useState<string>("CS301");
  const [dailyQr, setDailyQr] = useState<QRCodeResponse | null>(null);
  const [scanToken, setScanToken] = useState("");
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFacultyDashboard = async () => {
    try {
      const [qrRes, repRes] = await Promise.all([
        api.getDailyQRCode(selectedSubj).catch(() => null),
        api.getAttendanceReport({ subjectCode: selectedSubj }).catch(() => []),
      ]);
      setDailyQr(qrRes);
      setRecords(repRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFacultyDashboard();
  }, [selectedSubj]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanToken.trim()) return;
    try {
      setLoading(true);
      const res = await api.markAttendance(scanToken.trim(), selectedSubj);
      toast.success(`Attendance marked ${res.status} for ${res.userName}!`);
      setScanToken("");
      loadFacultyDashboard();
    } catch (err: any) {
      toast.error(err.message || "Invalid or wrong QR code token!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Session Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 bg-card">
        <div>
          <h3 className="font-semibold text-sm">Active Class Session</h3>
          <p className="text-xs text-muted-foreground">Select the subject to display classroom QR code and record student scans.</p>
        </div>
        <div className="flex gap-2">
          {TODAY_SUBJECT_SESSIONS.map((s) => (
            <Button
              key={s.code}
              size="sm"
              variant={selectedSubj === s.code ? "default" : "outline"}
              onClick={() => setSelectedSubj(s.code)}
            >
              {s.code}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Session Scans" value={records.length} icon={Users} />
        <StatCard label="Present Students" value={records.filter((r) => r.status === "PRESENT").length} icon={CheckCircle2} accent="chart-3" />
        <StatCard label="Late Students" value={records.filter((r) => r.status === "LATE").length} icon={AlertCircle} accent="chart-4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Classroom QR Code Display */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> {selectedSubj} Classroom QR
            </CardTitle>
            <Button size="icon" variant="ghost" onClick={loadFacultyDashboard}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-3 text-center">
            {dailyQr?.qrCodeBase64 ? (
              <div className="rounded-2xl border bg-white p-3 shadow-md">
                <img src={dailyQr.qrCodeBase64} alt="Classroom QR" className="h-48 w-48 object-contain" />
              </div>
            ) : (
              <div className="grid h-48 w-48 place-items-center rounded-2xl border bg-muted text-xs">Loading QR...</div>
            )}
            <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground truncate max-w-full font-bold">
              {dailyQr?.token || "Generating..."}
            </div>
            <p className="text-xs text-muted-foreground">Project this on screen for students in {selectedSubj}.</p>
          </CardContent>
        </Card>

        {/* Faculty Scanner Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" /> Faculty Attendance Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleScanSubmit} className="space-y-3">
              <div className="text-xs text-muted-foreground">Scan or type student token. Wrong tokens will be rejected automatically:</div>
              <div className="flex gap-2">
                <Input
                  placeholder={`Paste student token for ${selectedSubj}...`}
                  value={scanToken}
                  onChange={(e) => setScanToken(e.target.value)}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? "Validating..." : "Mark Attendance"}
                </Button>
              </div>
            </form>

            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Live Scans for {selectedSubj}</h4>
              {records.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.slice(0, 5).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.userName || r.userEmail}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(r.markedAt).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "PRESENT" ? "default" : "secondary"}>{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No attendance records logged for {selectedSubj} today yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminLiveDash() {
  const [records, setRecords] = useState<AttendanceResponse[]>([]);

  useEffect(() => {
    api.getAttendanceReport().then(setRecords).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Attendance Logs" value={records.length} icon={Users} />
        <StatCard label="Present Percentage" value="94%" icon={TrendingUp} accent="chart-2" />
        <StatCard label="Active Subject Sessions" value={TODAY_SUBJECT_SESSIONS.length} icon={BookOpen} accent="chart-3" />
        <StatCard label="Total Registered Students" value="250+" icon={CalendarCheck} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">System-Wide Live Attendance Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Subject Session</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.slice(0, 10).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.userName || r.userEmail}</TableCell>
                  <TableCell>{r.subjectCode || "CS301"} - {r.subjectName || "Data Structures"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.date} {new Date(r.markedAt).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "PRESENT" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
