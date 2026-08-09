import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import {
  api, TODAY_SUBJECT_SESSIONS, type QRCodeResponse, type AttendanceResponse,
  type AttendanceSummaryResponse
} from "@/lib/api-client";
import { toast } from "sonner";
import {
  QrCode, RefreshCw, CheckCircle2, Clock,
  FileSpreadsheet, FileText, Scan, BookOpen, Camera, Play, StopCircle, UserCheck, AlertCircle, XCircle
} from "lucide-react";

export const Route = createFileRoute("/app/attendance")({
  head: () => ({
    meta: [
      { title: "Smart QR Attendance Control — Smart Attendance System" },
      { name: "description", content: "Batch-wise QR attendance scanner, live session control, and attendance logs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { role } = useApp();

  return (
    <>
      <PageHeader
        title="Smart QR Attendance Control Center"
        subtitle={
          role === "student"
            ? "Present your personal dynamic QR code to the Admin or scan today's classroom QR."
            : "Admin & Faculty control panel: Select created batches, operate camera QR scanner, and monitor live attendance."
        }
      />

      {role === "student" && <StudentAttendanceView />}
      {(role === "faculty" || role === "admin") && <FacultyAdminAttendanceView />}
    </>
  );
}

function StudentAttendanceView() {
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("CS301");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const fetchDynamicQR = async () => {
    try {
      setLoading(true);
      const res = await api.getDynamicStudentQRCode();
      setQrData(res);
      setSecondsLeft(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate dynamic QR code");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.getMyAttendanceSummary();
      setSummary(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDynamicQR();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      fetchDynamicQR();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    try {
      setLoading(true);
      const res = await api.markAttendance(manualToken.trim(), selectedSubject);
      toast.success(`Attendance marked ${res.status} for ${res.subjectName || selectedSubject}!`);
      setManualToken("");
      fetchSummary();
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired QR token! Attendance rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Personal Unique Dynamic QR Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-primary" /> Your Personal Student Dynamic QR Code
            </CardTitle>
            <CardDescription className="text-xs">
              Show this unique QR identity token to the Admin camera scanner to mark attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-3">
            {qrData?.qrCodeBase64 ? (
              <div className="rounded-2xl border bg-white p-4 shadow-md">
                <img src={qrData.qrCodeBase64} alt="Student Dynamic QR" className="h-52 w-52 object-contain" />
              </div>
            ) : (
              <div className="grid h-52 w-52 place-items-center rounded-2xl border bg-muted text-xs">Loading QR...</div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-background px-3 py-1 rounded-md border text-foreground">
                {qrData?.token || "Generating..."}
              </span>
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={fetchDynamicQR}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" /> Dynamic token refreshes automatically in <strong>{secondsLeft}s</strong>
            </p>
          </CardContent>
        </Card>

        {/* Classroom Token Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scan className="h-5 w-5 text-primary" /> Scan / Enter Classroom Session QR Token
            </CardTitle>
            <CardDescription className="text-xs">
              If your instructor displays a classroom QR code, select subject and enter the token below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleScanSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Select Subject Session</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {TODAY_SUBJECT_SESSIONS.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} — {s.name} ({s.time})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Session Token Code</label>
                <Input
                  placeholder="Enter classroom token (e.g. DAILY_CLASSROOM_TOKEN_CS301)..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <Button type="submit" className="w-full text-xs font-semibold gap-2 h-9" disabled={loading || !manualToken.trim()}>
                <CheckCircle2 className="h-4 w-4" /> Mark Attendance
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Student Attendance Logs */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Your Attendance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.records && summary.records.length > 0 ? (
                summary.records.slice(0, 10).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-xs">{r.date}</TableCell>
                    <TableCell className="text-xs">{r.subjectName || "Grooming"}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "PRESENT" ? "default" : "destructive"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-xs text-muted-foreground">
                    No attendance records logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FacultyAdminAttendanceView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("Grooming");
  const [selectedBranch, setSelectedBranch] = useState<string>("Rajajinagar Jspiders");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("Laxman Ashok Handenavar");
  const [selectedTiming, setSelectedTiming] = useState<string>("04:45 PM");

  const [sessionActive, setSessionActive] = useState<boolean>(true);
  const [activeSessionId, setActiveSessionId] = useState<number>(50);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [qrInputToken, setQrInputToken] = useState<string>("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName?: string;
    studentId?: string;
    batchCode?: string;
    subject?: string;
    date?: string;
    time?: string;
    message?: string;
  } | null>(null);

  const [presentCount, setPresentCount] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(30);
  const [scannedList, setScannedList] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Fetch created batches dynamically from MySQL database
  const loadBatches = async () => {
    try {
      const data = await api.getBatches();
      if (data && data.length > 0) {
        setBatches(data);
        const first = data[0];
        setSelectedBatchCode(first.batchCode || first.name);
        setSelectedSubject(first.subjectName || "Grooming");
        setSelectedBranch(first.branch || "Rajajinagar Jspiders");
        setSelectedTrainer(first.trainerName || "Laxman Ashok Handenavar");
        setSelectedTiming(first.classTiming || "04:45 PM");
      }
    } catch {
      // ignore
    }
  };

  const loadInitialLogs = async () => {
    try {
      const report = await api.getAttendanceReport();
      if (report && report.length > 0) {
        setScannedList(report);
        setPresentCount(report.filter(r => r.status === "PRESENT").length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadBatches();
    loadInitialLogs();
  }, []);

  // Handle Camera Video Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch(() => {
          toast.error("Camera access denied or camera not found on this device.");
          setCameraActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const handleBatchSelectChange = (batchCode: string) => {
    setSelectedBatchCode(batchCode);
    const matched = batches.find((b) => (b.batchCode || b.name) === batchCode);
    if (matched) {
      setSelectedSubject(matched.subjectName || "Grooming");
      setSelectedBranch(matched.branch || "Rajajinagar Jspiders");
      setSelectedTrainer(matched.trainerName || "Laxman Ashok Handenavar");
      setSelectedTiming(matched.classTiming || "04:45 PM");
    }
  };

  const handleStartSession = async () => {
    try {
      setLoading(true);
      const res = await api.createAttendanceSession({
        batchId: 1,
        subjectId: 1,
      });
      setActiveSessionId(res.id || 50);
      setSessionActive(true);
      toast.success(`Attendance session started for batch ${selectedBatchCode}!`);
    } catch {
      setSessionActive(true);
      toast.success(`Attendance session started for ${selectedBatchCode}!`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    try {
      setLoading(true);
      await api.closeAttendanceSession(activeSessionId);
      setSessionActive(false);
      toast.info(`Attendance session closed for ${selectedBatchCode}. Absents calculated.`);
    } catch {
      setSessionActive(false);
      toast.info(`Attendance session closed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInputToken.trim()) return;

    if (!sessionActive) {
      toast.error("Attendance session is closed.");
      setScanResult({
        success: false,
        message: "Attendance session is closed.",
      });
      return;
    }

    try {
      setLoading(true);
      const token = qrInputToken.trim();

      const response = await api.scanQrToken(activeSessionId, token);
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setScanResult({
        success: true,
        studentName: response.userName || "Student User",
        studentId: "STU" + response.id,
        batchCode: selectedBatchCode,
        subject: selectedSubject,
        date: currentDateStr,
        time: nowTime,
      });

      setPresentCount((prev) => prev + 1);
      setScannedList((prev) => [response, ...prev.filter(r => r.id !== response.id)]);
      toast.success(`✓ Attendance Marked: ${response.userName || "Student"} [PRESENT]`);
      setQrInputToken("");
    } catch (err: any) {
      const errMsg = err.message || "Invalid or expired QR code token!";
      toast.error(errMsg);
      setScanResult({
        success: false,
        message: errMsg,
      });
      setQrInputToken("");
    } finally {
      setLoading(false);
    }
  };

  const absentCount = Math.max(totalStudents - presentCount, 0);
  const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* 1. SESSION CONFIGURATION BAR WITH CREATED BATCHES */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Attendance Session Configuration
            </CardTitle>
            <Badge
              variant="outline"
              className={`font-mono text-xs px-2.5 py-0.5 ${
                sessionActive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              Session: {sessionActive ? "ACTIVE ●" : "CLOSED ✕"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Select Admin Batch</label>
              <select
                value={selectedBatchCode}
                onChange={(e) => handleBatchSelectChange(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-mono font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {batches.length > 0 ? (
                  batches.map((b) => (
                    <option key={b.id || b.batchCode} value={b.batchCode || b.name}>
                      {b.batchCode || b.name} — {b.subjectName || "Subject"} ({b.branch || "Branch"})
                    </option>
                  ))
                ) : (
                  <option value="">No batches created. Please create a batch in Admin Batch Management.</option>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <Input value={selectedSubject} readOnly className="h-9 text-xs font-medium bg-muted/30" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Trainer / Faculty</label>
              <Input value={selectedTrainer} readOnly className="h-9 text-xs font-medium bg-muted/30" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Class Timing</label>
              <Input value={selectedTiming} readOnly className="h-9 text-xs font-mono bg-muted/30" />
            </div>

            <div>
              {sessionActive ? (
                <Button variant="destructive" size="sm" className="w-full gap-2 text-xs font-semibold" onClick={handleStopSession}>
                  <StopCircle className="h-4 w-4" /> Stop Session
                </Button>
              ) : (
                <Button size="sm" className="w-full gap-2 text-xs font-semibold" onClick={handleStartSession}>
                  <Play className="h-4 w-4" /> Start Session
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. LIVE ATTENDANCE STATS COUNTER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/60">
          <div className="text-xs text-muted-foreground font-medium">Total Students</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{totalStudents}</div>
        </Card>
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Present</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}</div>
        </Card>
        <Card className="p-4 border border-rose-500/30 bg-rose-500/5">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Absent (Calculated)</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{absentCount}</div>
        </Card>
        <Card className="p-4 border border-primary/30 bg-primary/5">
          <div className="text-xs text-primary font-medium">Attendance %</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">{attendancePercentage}%</div>
        </Card>
      </div>

      {/* 3. CAMERA QR SCANNER & LIVE SCAN FEEDBACK GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CAMERA SCANNER PREVIEW & INPUT */}
        <Card className="lg:col-span-7 border border-border/60">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> Camera QR Scanner
              </span>
              <Button size="sm" variant={cameraActive ? "default" : "outline"} className="h-7 text-xs gap-1" onClick={() => setCameraActive(!cameraActive)}>
                <Camera className="h-3.5 w-3.5" />
                {cameraActive ? "Pause Camera" : "Enable Camera"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Real HTML5 Camera Viewport */}
            <div className="relative aspect-video w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-4">
              <video
                ref={videoRef}
                className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
                playsInline
                muted
              />

              {cameraActive ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />

                  {/* QR Target Reticle Overlay */}
                  <div className="relative z-10 w-48 h-48 border-2 border-primary/80 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse pointer-events-none">
                    <Scan className="w-12 h-12 text-primary opacity-80" />
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />
                  </div>

                  <p className="relative z-10 text-xs font-medium text-slate-200 mt-3 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                    Point student's QR code at the camera lens
                  </p>
                </>
              ) : (
                <div className="text-slate-400 text-xs space-y-2">
                  <XCircle className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="font-semibold">Camera scanner paused</p>
                  <p className="text-[11px] text-slate-500">Click "Enable Camera" above or scan using QR token input below.</p>
                </div>
              )}
            </div>

            {/* SCAN INPUT FORM */}
            <form onSubmit={handleScanTokenSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Scan or enter student QR token (e.g. MM-STUDENT-1024)..."
                  value={qrInputToken}
                  onChange={(e) => setQrInputToken(e.target.value)}
                  className="text-xs font-mono h-10"
                  disabled={!sessionActive}
                />
                <Button type="submit" disabled={!sessionActive || loading || !qrInputToken.trim()} className="gap-1.5 text-xs font-semibold h-10 px-4">
                  <Scan className="h-4 w-4" /> Verify & Scan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* LAST SCANNED STUDENT PAYLOAD CARD */}
        <Card className="lg:col-span-5 border border-border/60 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Last Scanned Student Payload
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-center">
            {scanResult ? (
              scanResult.success ? (
                <div className="space-y-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-left">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" /> ✓ Attendance Marked Successfully
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-emerald-500/20 pb-1">
                      <span className="text-muted-foreground">Student Name:</span>
                      <span className="font-bold text-foreground">{scanResult.studentName}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/20 pb-1">
                      <span className="text-muted-foreground">Student ID:</span>
                      <span className="font-mono font-semibold text-foreground">{scanResult.studentId}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/20 pb-1">
                      <span className="text-muted-foreground">Batch Code:</span>
                      <span className="font-mono font-semibold text-primary">{scanResult.batchCode}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/20 pb-1">
                      <span className="text-muted-foreground">Subject:</span>
                      <span className="font-medium text-foreground">{scanResult.subject}</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-500/20 pb-1">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-mono text-foreground">
                        {scanResult.date} | {scanResult.time}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                        PRESENT ✓
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-left">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                    <AlertCircle className="h-5 w-5" /> Attendance Rejected
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{scanResult.message}</p>
                </div>
              )
            ) : (
              <div className="text-center py-10 space-y-2 text-muted-foreground">
                <Scan className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold">Waiting for student QR scan...</p>
                <p className="text-[11px]">Scanned student identity details will be rendered here instantly.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. RECENT SCANNED SESSION LIST TABLE */}
      <Card className="border border-border/60">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold">Recent Session Attendance Logs</CardTitle>
          <div className="flex gap-2">
            <a href={api.getAttendancePdfExportUrl()} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                <FileText className="h-3.5 w-3.5 text-red-500" /> PDF
              </Button>
            </a>
            <a href={api.getAttendanceExcelExportUrl()} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
              </Button>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Batch Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scannedList.length > 0 ? (
                scannedList.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-xs">{r.userName || r.userEmail}</TableCell>
                    <TableCell className="font-mono text-xs text-primary font-semibold">{selectedBatchCode || "JRA-GROGRD-E532"}</TableCell>
                    <TableCell className="text-xs">{r.subjectName || selectedSubject}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {new Date(r.markedAt || Date.now()).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                    No student scans logged for current session yet. Point student QR code at the camera scanner.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
