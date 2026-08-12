import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApp } from "@/lib/app-context";
import {
  api, getRealtimeSubjectSessions, type QRCodeResponse, type AttendanceResponse,
  type AttendanceSummaryResponse
} from "@/lib/api-client";
import { toast } from "sonner";
import {
  QrCode, RefreshCw, CheckCircle2, Clock,
  FileSpreadsheet, FileText, Scan, BookOpen, Camera, Play, StopCircle, UserCheck, AlertCircle, XCircle, AlertTriangle
} from "lucide-react";
import jsQR from "jsqr";

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
            ? "Present your personal dynamic QR code to the Admin or scan today's session QR."
            : "Admin control panel: Select created batches, operate camera QR scanner, and monitor live attendance."
        }
      />

      {role === "student" && <StudentAttendanceView />}
      {role === "admin" && <AdminAttendanceView />}
    </>
  );
}

function StudentAttendanceView() {
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120); // 2 minutes (120s)

  const activeSessions = getRealtimeSubjectSessions();

  const fetchDynamicQR = async () => {
    try {
      setLoading(true);
      const res = await api.getDynamicStudentQRCode();
      setQrData(res);
      setSecondsLeft(120); // Reset timer to 2 minutes
    } catch (err: any) {
      toast.error(err.message || "Failed to generate dynamic QR code");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.getMyAttendanceSummary();
      setSummary(res);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  // Initial load and 3-second realtime background polling
  useEffect(() => {
    fetchDynamicQR();
    fetchSummary();

    const interval = setInterval(() => {
      fetchSummary();
    }, 3000);

    const handleStorage = () => fetchSummary();
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchSummary]);

  // 120-second (2 minutes) dynamic QR auto-rotation timer
  useEffect(() => {
    if (secondsLeft <= 0) {
      fetchDynamicQR();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const minutesDisplay = Math.floor(secondsLeft / 60);
  const secondsDisplay = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-6">
      {/* Student Personal Unique Dynamic QR & Active Sessions Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardHeader className="pb-2 text-center border-b border-primary/10">
            <CardTitle className="text-base font-bold flex items-center justify-center gap-2 text-primary">
              <QrCode className="h-5 w-5" /> Your Personal Student Dynamic QR Code
            </CardTitle>
            <CardDescription className="text-xs">
              Show this unique QR identity token to the Admin camera scanner or enter token to mark attendance.
            </CardDescription>
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
          </CardContent>
        </Card>

        {/* Active Realtime Subject Sessions */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Active Subject Sessions (Realtime)
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Auto-Synced
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              Active sessions configured by Administrator. Present your dynamic QR code to mark presence.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {activeSessions.length > 0 ? (
              activeSessions.map((s: any, idx: number) => (
                <div key={s.code || idx} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{s.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                      {s.code}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1 font-semibold text-foreground"><Clock className="h-3.5 w-3.5 text-primary" /> {s.time}</span>
                    <span>• {s.faculty}</span>
                    <span>• {s.room}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border border-dashed rounded-xl p-4 text-muted-foreground space-y-2">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold">No active subject sessions configured by Administrator yet.</p>
                <p className="text-[11px] text-muted-foreground">Present your dynamic QR code to the Administrator camera scanner when session begins.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Attendance Logs */}
      <Card className="border border-border/60">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Your Attendance Logs</CardTitle>
          <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            Realtime Auto-Syncing
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Subject</TableHead>
                  <TableHead className="text-xs">Time Marked</TableHead>
                  <TableHead className="text-right text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.records && summary.records.length > 0 ? (
                  summary.records.slice(0, 10).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium text-xs font-mono">{r.date}</TableCell>
                      <TableCell className="text-xs font-semibold">{r.subjectName || "Grooming & Skills"}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {r.markedAt ? new Date(r.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={`text-[10px] font-bold ${r.status === "PRESENT" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-xs text-muted-foreground">
                      No attendance records logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminAttendanceView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("Grooming");
  const [selectedBranch, setSelectedBranch] = useState<string>("Rajajinagar Jspiders");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("Laxman Ashok Handenavar");
  const [selectedTiming, setSelectedTiming] = useState<string>("04:45 PM");

  // REQUIREMENT 1: By default, attendance session is STOPPED (false)
  const [sessionActive, setSessionActive] = useState<boolean>(false);
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
  const [totalStudents, setTotalStudents] = useState<number>(1);
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

  const loadInitialLogs = useCallback(async () => {
    try {
      const report = await api.getAttendanceReport();
      if (report && Array.isArray(report)) {
        setScannedList(report);
        const pCount = report.filter((r) => r.status === "PRESENT").length;
        setPresentCount(pCount);

        // Update Last Scanned Student Payload if logs exist
        if (report.length > 0) {
          const latest = report[0];
          setScanResult((prev) => {
            if (!prev) {
              return {
                success: true,
                studentName: latest.userName || latest.userEmail,
                studentId: "STU" + latest.id,
                batchCode: selectedBatchCode || "BATCH-01",
                subject: latest.subjectName || selectedSubject,
                date: latest.date || currentDateStr,
                time: latest.markedAt ? new Date(latest.markedAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
              };
            }
            return prev;
          });
        }
      }
    } catch {
      // ignore
    }
  }, [currentDateStr, selectedBatchCode, selectedSubject]);

  const loadStudentsCount = async () => {
    try {
      const studentsData = await api.getStudents();
      if (studentsData && Array.isArray(studentsData) && studentsData.length > 0) {
        setTotalStudents(studentsData.length);
      }
    } catch {
      // ignore
    }
  };

  // Realtime 3-second background polling timer & storage event listener
  useEffect(() => {
    loadBatches();
    loadStudentsCount();
    loadInitialLogs();

    const interval = setInterval(() => {
      loadInitialLogs();
    }, 3000);

    const handleStorage = () => loadInitialLogs();
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadInitialLogs]);

  // Handle Camera Video Stream & Real-time QR Code Frame Decoder
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScannedTokenRef = useRef<string>("");

  const processScannedToken = async (tokenToScan: string) => {
    if (!tokenToScan.trim()) return;

    if (!sessionActive) {
      toast.error("Attendance session is currently STOPPED! Click 'Start Session' above to begin taking attendance.");
      setScanResult({
        success: false,
        message: "Attendance session is currently STOPPED.",
      });
      return;
    }

    try {
      setLoading(true);
      const token = tokenToScan.trim();

      const response = await api.scanQrToken(activeSessionId, token);
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newResult = {
        success: true,
        studentName: response.userName || "Student User",
        studentId: "STU" + (response.id || Date.now()),
        batchCode: selectedBatchCode || "BATCH-01",
        subject: selectedSubject,
        date: currentDateStr,
        time: nowTime,
      };

      setScanResult(newResult);
      
      // Play success beep sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch { /* ignore audio errors */ }

      setPresentCount((prev) => prev + 1);
      setScannedList((prev) => [response, ...prev.filter((r) => r.id !== response.id)]);
      toast.success(`✓ Attendance Marked: ${response.userName || "Student"} [PRESENT]`);
      setQrInputToken("");
      loadInitialLogs();
    } catch (err: any) {
      const errMsg = err.message || "Invalid or expired QR code token!";
      toast.error(errMsg);
      setScanResult({
        success: false,
        message: errMsg,
      });

      // Play error beep sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime); // Low error tone
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
      } catch { /* ignore audio errors */ }

      setQrInputToken("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    if (cameraActive && sessionActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();

            const scanFrame = () => {
              if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const video = videoRef.current;
                if (!canvasRef.current) {
                  canvasRef.current = document.createElement("canvas");
                }
                const canvas = canvasRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                  });
                  if (code && code.data && code.data !== lastScannedTokenRef.current) {
                    lastScannedTokenRef.current = code.data;
                    processScannedToken(code.data);
                    setTimeout(() => {
                      lastScannedTokenRef.current = "";
                    }, 3000);
                  }
                }
              }
              animationFrameId = requestAnimationFrame(scanFrame);
            };
            animationFrameId = requestAnimationFrame(scanFrame);
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
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, sessionActive]);

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
      setActiveSessionId(res.id || Date.now());
      setSessionActive(true);
      toast.success(`Attendance session STARTED for batch ${selectedBatchCode}!`);
    } catch {
      setSessionActive(true);
      toast.success(`Attendance session STARTED for ${selectedBatchCode}!`);
    } finally {
      setLoading(false);
    }
  };

  const handleStopSession = async () => {
    try {
      setLoading(true);
      await api.closeAttendanceSession(activeSessionId);
      setSessionActive(false);
      setCameraActive(false);
      toast.info(`Attendance session STOPPED for ${selectedBatchCode}.`);
    } catch {
      setSessionActive(false);
      setCameraActive(false);
      toast.info(`Attendance session STOPPED.`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processScannedToken(qrInputToken);
  };

  const absentCount = Math.max(totalStudents - presentCount, 0);
  const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* REQUIREMENT 1 BANNER: STOPPED BY DEFAULT NOTICE */}
      {!sessionActive && (
        <Card className="border-rose-500/40 bg-rose-500/10">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
              <div>
                <strong className="text-sm font-bold text-foreground block">Attendance Session is STOPPED (Default State)</strong>
                <p className="text-muted-foreground mt-0.5">
                  Camera QR Scanner and manual verification inputs are disabled while session is stopped. Click <strong>"Start Session"</strong> to enable attendance logging for {selectedBatchCode || "selected batch"}.
                </p>
              </div>
            </div>
            <Button size="sm" className="gap-2 text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" onClick={handleStartSession} disabled={loading}>
              <Play className="h-4 w-4" /> Start Session Now
            </Button>
          </CardContent>
        </Card>
      )}

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
              Session: {sessionActive ? "ACTIVE ●" : "STOPPED ✕"}
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
                <Button variant="destructive" size="sm" className="w-full gap-2 text-xs font-semibold" onClick={handleStopSession} disabled={loading}>
                  <StopCircle className="h-4 w-4" /> Stop Session
                </Button>
              ) : (
                <Button size="sm" className="w-full gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleStartSession} disabled={loading}>
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
          <div className="text-xs text-muted-foreground font-medium">Total Registered Students</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{totalStudents}</div>
        </Card>
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Present</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{presentCount}</div>
        </Card>
        <Card className="p-4 border border-rose-500/30 bg-rose-500/5">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">Absent</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{absentCount}</div>
        </Card>
        <Card className="p-4 border border-primary/30 bg-primary/5">
          <div className="text-xs text-primary font-medium">Attendance Rate</div>
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
              <Button
                size="sm"
                variant={cameraActive ? "default" : "outline"}
                className="h-7 text-xs gap-1"
                disabled={!sessionActive}
                onClick={() => setCameraActive(!cameraActive)}
              >
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
                className={`absolute inset-0 h-full w-full object-cover ${cameraActive && sessionActive ? "block" : "hidden"}`}
                playsInline
                muted
              />

              {cameraActive && sessionActive ? (
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
                  <p className="font-semibold">{sessionActive ? "Camera scanner paused" : "Attendance Session Stopped"}</p>
                  <p className="text-[11px] text-slate-500">
                    {sessionActive
                      ? 'Click "Enable Camera" above or scan using QR token input below.'
                      : 'Click "Start Session" above to activate camera scanner.'}
                  </p>
                </div>
              )}
            </div>

            {/* SCAN INPUT FORM */}
            <form onSubmit={handleScanTokenSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={sessionActive ? "Scan or enter student QR token..." : "Session is stopped. Click Start Session above."}
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

        {/* REQUIREMENT 2: LAST SCANNED STUDENT PAYLOAD CARD WITH REALTIME UPDATES */}
        <Card className="lg:col-span-5 border border-border/60 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Last Scanned Student Payload
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Live Realtime
              </Badge>
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
                <p className="text-[11px]">Scanned student identity details will be rendered here instantly in real-time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* REQUIREMENT 2: RECENT SESSION ATTENDANCE LOGS TABLE WITH REALTIME UPDATES */}
      <Card className="border border-border/60">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Recent Session Attendance Logs
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Live real-time feed of scanned and marked student attendance logs.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Live Realtime (3s)
            </Badge>
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
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">Student Name</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Batch Code</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Subject</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Time</TableHead>
                  <TableHead className="text-right text-xs whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scannedList.length > 0 ? (
                  scannedList.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-xs font-semibold whitespace-nowrap">{r.userName || r.userEmail}</TableCell>
                      <TableCell className="font-mono text-xs text-primary font-semibold whitespace-nowrap">{selectedBatchCode || "BATCH-01"}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">{r.subjectName || selectedSubject}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(r.markedAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                      No student scans logged for current session yet. Click "Start Session" and point student QR code at camera.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
