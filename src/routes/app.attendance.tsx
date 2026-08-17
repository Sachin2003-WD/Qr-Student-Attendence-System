import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
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
  type QRCodeResponse,
  type AttendanceResponse,
  type AttendanceSummaryResponse,
} from "@/lib/api-client";
import { toast } from "sonner";
import {
  QrCode,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Scan,
  BookOpen,
  Camera,
  Play,
  StopCircle,
  UserCheck,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  User,
  Users,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  Upload,
} from "lucide-react";
import jsQR from "jsqr";

export const Route = createFileRoute("/app/attendance")({
  head: () => ({
    meta: [
      { title: "Smart QR Attendance Control — Smart Attendance System" },
      {
        name: "description",
        content:
          "Automatic camera QR attendance scanner, live session control, confirmation sound, and real-time payload inspector.",
      },
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
        title="Smart QR Attendance Control"
        subtitle="Automatic camera QR scanning with audio feedback confirmation, live session control, and scanned student payload inspection."
      />
      {role === "admin" ? <AdminAttendanceView /> : <StudentAttendanceView />}
    </>
  );
}

// ========================================================
// 1. STUDENT ATTENDANCE VIEW (SHOWCASE DYNAMIC QR TO SCAN)
// ========================================================
function StudentAttendanceView() {
  const [qrData, setQrData] = useState<QRCodeResponse | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryResponse | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchStudentData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [qr, sum, batches] = await Promise.all([
        api.getDynamicStudentQR(),
        api.getMyAttendanceSummary(),
        api.getBatches().catch(() => []),
      ]);
      setQrData(qr);
      setSummary(sum);

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
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData(false);
    const interval = setInterval(() => {
      fetchStudentData(true);
    }, 120000);

    const handleStorage = () => fetchStudentData(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleCopy = () => {
    if (!qrData?.token) return;
    navigator.clipboard.writeText(qrData.token);
    setCopied(true);
    toast.success("Daily dynamic QR token copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const studentEmail = localStorage.getItem("sa.email") || "sachin@college.edu";
  const studentName = localStorage.getItem("sa.name") || studentEmail.split("@")[0] || "Student";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ENLARGED STUDENT DYNAMIC QR CARD */}
        <Card className="md:col-span-6 border-primary/30 bg-primary/5 shadow-sm flex flex-col justify-between">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-bold flex items-center justify-center gap-2 text-primary">
              <QrCode className="h-6 w-6" /> Your Personal Dynamic Attendance QR
            </CardTitle>
            <CardDescription className="text-xs">
              Point this dynamic QR code at the Admin / Faculty camera scanner. It scans instantly
              with automatic audio feedback confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-2 pb-6">
            {/* Enlarged QR Code Canvas Viewport */}
            {qrData?.qrCodeBase64 ? (
              <div className="p-4 sm:p-5 bg-white rounded-3xl shadow-xl border-4 border-primary/20 transition-all hover:scale-[1.02]">
                <img
                  src={qrData.qrCodeBase64}
                  alt="Student Dynamic QR"
                  className="h-64 w-64 sm:h-72 sm:w-72 object-contain"
                />
              </div>
            ) : (
              <div className="grid h-64 w-64 sm:h-72 sm:w-72 place-items-center rounded-3xl border-2 border-dashed bg-card text-xs">
                <div className="space-y-2 text-center p-4">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="font-semibold text-foreground">Generating Live Dynamic QR…</p>
                </div>
              </div>
            )}

            {/* Student Info Chip */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-bold text-foreground bg-background px-3 py-1 rounded-full border border-border">
                {studentName}
              </span>
              <span className="font-mono text-[11px] text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                1RA21CS002
              </span>
              <span className="text-[11px] text-muted-foreground bg-background px-2.5 py-1 rounded-full border border-border">
                Computer Science
              </span>
            </div>

            {/* Token Copy Bar */}
            <div className="space-y-2 max-w-sm w-full">
              <div className="flex items-center justify-between text-xs font-mono font-bold bg-background p-2.5 rounded-xl border border-border shadow-xs">
                <span className="text-primary truncate">{qrData?.token || "Generating..."}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 text-xs px-2 cursor-pointer"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => fetchStudentData(false)}
                    title="Refresh Dynamic QR"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Session History */}
        <Card className="md:col-span-6 border-border/60 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Today's Attendance Logs
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {summary?.records && summary.records.length > 0 ? (
              <div className="space-y-2">
                {summary.records.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-border/60 flex items-center justify-between text-xs bg-muted/20"
                  >
                    <div>
                      <div className="font-bold text-foreground">
                        {r.subjectName || "Subject Session"}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {r.date} •{" "}
                        {r.markedAt ? new Date(r.markedAt).toLocaleTimeString() : "Marked"}
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                      PRESENT ✓
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-muted-foreground">
                <QrCode className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-xs font-semibold">No attendance marked yet today.</p>
                <p className="text-[11px]">
                  Point your dynamic QR code above at the camera scanner to record presence.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========================================================
// 2. ADMIN/FACULTY ATTENDANCE VIEW (AUTOMATIC SCANNER + AUDIO + PAYLOAD)
// ========================================================
function AdminAttendanceView() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [selectedTiming, setSelectedTiming] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("Computer Science");

  // Session state
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<number>(50);

  // Camera & Audio states
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scanFlash, setScanFlash] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [qrInputToken, setQrInputToken] = useState<string>("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    studentName?: string;
    studentEmail?: string;
    studentId?: string;
    department?: string;
    section?: string;
    batchCode?: string;
    subject?: string;
    trainer?: string;
    date?: string;
    time?: string;
    rawToken?: string;
    message?: string;
  } | null>(null);

  const [presentCount, setPresentCount] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(1);
  const [scannedList, setScannedList] = useState<AttendanceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const currentDateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Synthesize positive confirmation double-chime sound via Web Audio API
  const playScanConfirmationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;

      // Note 1 (A5 - 880Hz)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2 (A6 - 1760Hz confirmation chord)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1760, now + 0.08);
      gain2.gain.setValueAtTime(0.35, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    } catch (err) {
      console.warn("Audio feedback error:", err);
    }
  }, [soundEnabled]);

  // Synthesize warning/error tone (300Hz low)
  const playScanErrorSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (err) {
      console.warn("Audio feedback error:", err);
    }
  }, [soundEnabled]);

  // Fetch batches dynamically
  const loadBatches = async () => {
    try {
      const data = await api.getBatches();
      if (data && data.length > 0) {
        setBatches(data);
        const first = data[0];
        setSelectedBatchCode(first.batchCode || first.name || "");
        setSelectedSubject(first.subjectName || "");
        setSelectedBranch(first.branch || "");
        setSelectedTrainer(first.trainerName || "");
        setSelectedTiming(first.classTiming || "");
        setSelectedDepartment(first.departmentName || "Computer Science");
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

        if (report.length > 0) {
          const latest = report[0];
          setScanResult((prev) => {
            if (!prev) {
              const usnFromDevice = latest.deviceInfo?.startsWith("USN: ")
                ? latest.deviceInfo.replace("USN: ", "")
                : "1RA21CS001";
              return {
                success: true,
                studentName: latest.userName || latest.userEmail || "Student User",
                studentEmail: latest.userEmail || "student@college.edu",
                studentId: usnFromDevice,
                department: selectedDepartment || "Computer Science",
                section: "Section A",
                batchCode: selectedBatchCode || "BATCH-01",
                subject: latest.subjectName || selectedSubject || "Subject Session",
                trainer: selectedTrainer || "Faculty Lead",
                date: latest.date || currentDateStr,
                time: latest.markedAt
                  ? new Date(latest.markedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                  : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                rawToken: getDailyStudentToken(latest.userEmail || latest.userName),
              };
            }
            return prev;
          });
        }
      }
    } catch {
      // ignore
    }
  }, [currentDateStr, selectedBatchCode, selectedSubject, selectedDepartment, selectedTrainer]);

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

  // Real-time 3s auto-sync
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

  // Frame processing and automatic QR decoder
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedTokenRef = useRef<string>("");
  const lastScanTimestampRef = useRef<number>(0);

  const processScannedToken = async (tokenToScan: string, isFromCamera = false) => {
    if (!tokenToScan || !tokenToScan.trim()) return;

    if (!sessionActive) {
      toast.error(
        "Attendance session is currently STOPPED! Click 'Start Session' above to begin taking attendance.",
      );
      setScanResult({
        success: false,
        message: "Attendance session is currently STOPPED.",
      });
      playScanErrorSound();
      return;
    }

    try {
      setLoading(true);
      const token = tokenToScan.trim();

      // Trigger visual scanner flash
      setScanFlash(true);
      setTimeout(() => setScanFlash(false), 600);

      const response = await api.scanQrToken(activeSessionId, token);
      const nowTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Match student for enriched details
      const studentsList = await api.getStudents().catch(() => []);
      const matchedStudent = studentsList.find(
        (s: any) =>
          s.email?.toLowerCase() === response.userEmail?.toLowerCase() ||
          s.name?.toLowerCase() === response.userName?.toLowerCase() ||
          (s.usn && response.deviceInfo?.includes(s.usn)),
      );

      const studentUSN =
        matchedStudent?.usn ||
        (response.deviceInfo?.startsWith("USN: ") ? response.deviceInfo.replace("USN: ", "") : null) ||
        `1RA21CS0${String(response.id).slice(-2)}`;

      const newResult = {
        success: true,
        studentName: response.userName || matchedStudent?.name || "Student User",
        studentEmail: response.userEmail || matchedStudent?.email || "student@college.edu",
        studentId: studentUSN,
        department: matchedStudent?.department || selectedDepartment || "Computer Science",
        section: matchedStudent?.section || "Section A",
        batchCode: selectedBatchCode || "BATCH-01",
        subject: response.subjectName || selectedSubject || "Subject Session",
        trainer: selectedTrainer || "Faculty Lead",
        date: currentDateStr,
        time: nowTime,
        rawToken: token,
      };

      setScanResult(newResult);

      // Play positive audio confirmation beep
      playScanConfirmationSound();

      setPresentCount((prev) => prev + 1);
      setScannedList((prev) => [response, ...prev.filter((r) => r.id !== response.id)]);
      toast.success(`✓ Scanned & Verified: ${newResult.studentName} [PRESENT]`);
      setQrInputToken("");
      loadInitialLogs();
    } catch (err: any) {
      const errMsg = err.message || "Invalid or expired QR code token!";
      toast.error(errMsg);
      setScanResult({
        success: false,
        message: errMsg,
        rawToken: tokenToScan,
      });

      // Play error tone
      playScanErrorSound();
      setQrInputToken("");
    } finally {
      setLoading(false);
    }
  };

  // High-Performance Camera QR Detection Loop (Hardware BarcodeDetector + Dual-Stage Center-Crop jsQR)
  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;
    let isMounted = true;

    if (cameraActive && sessionActive) {
      const initCamera = async () => {
        try {
          let s: MediaStream;
          try {
            s = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: facingMode },
                width: { ideal: 1920, min: 640 },
                height: { ideal: 1080, min: 480 },
              },
            });
          } catch {
            // Graceful fallback for webcams or restricted browsers
            s = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
          }

          if (!isMounted) {
            s.getTracks().forEach((track) => track.stop());
            return;
          }

          stream = s;
          if (videoRef.current) {
            const video = videoRef.current;
            video.srcObject = s;
            video.setAttribute("playsinline", "true");
            video.muted = true;
            try {
              await video.play();
            } catch (pErr) {
              console.warn("Video play notice:", pErr);
            }

            let lastScanTime = 0;

            // Initialize Hardware BarcodeDetector if natively supported by browser
            let barcodeDetector: any = null;
            if (typeof window !== "undefined" && "BarcodeDetector" in window) {
              try {
                barcodeDetector = new (window as any).BarcodeDetector({
                  formats: ["qr_code"],
                });
              } catch {
                barcodeDetector = null;
              }
            }

            const scanFrame = async () => {
              if (!isMounted) return;

              if (
                video &&
                video.readyState >= 2 &&
                video.videoWidth > 0 &&
                video.videoHeight > 0 &&
                !isScanningRef.current
              ) {
                const now = Date.now();
                // Scan at ~30 FPS for instant hardware & optical software response
                if (now - lastScanTime > 30) {
                  lastScanTime = now;
                  isScanningRef.current = true;

                  try {
                    let detectedData: string | null = null;
                    const vW = video.videoWidth;
                    const vH = video.videoHeight;

                    // STAGE 1: Fast Center-Crop Pass at 100% Native Resolution
                    // The target reticle is centered. Cropping the central 65% square eliminates blur and decodes in 2ms.
                    if (!canvasRef.current) {
                      canvasRef.current = document.createElement("canvas");
                    }
                    const canvas = canvasRef.current;
                    const cropSize = Math.floor(Math.min(vW, vH) * 0.65);
                    const cropX = Math.floor((vW - cropSize) / 2);
                    const cropY = Math.floor((vH - cropSize) / 2);

                    canvas.width = cropSize;
                    canvas.height = cropSize;
                    const ctx = canvas.getContext("2d", { willReadFrequently: true });

                    if (ctx) {
                      ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
                      const cropImageData = ctx.getImageData(0, 0, cropSize, cropSize);
                      const centerCode = jsQR(cropImageData.data, cropSize, cropSize, {
                        inversionAttempts: "dontInvert",
                      });
                      if (centerCode && centerCode.data && centerCode.data.trim()) {
                        detectedData = centerCode.data.trim();
                      }
                    }

                    // STAGE 2: Hardware-Accelerated Native BarcodeDetector (GPU)
                    if (!detectedData && barcodeDetector) {
                      try {
                        const barcodes = await barcodeDetector.detect(video);
                        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                          detectedData = barcodes[0].rawValue.trim();
                        }
                      } catch {}
                    }

                    // STAGE 3: Full-frame jsQR with multi-contrast inversion attempts (for phone screen reflections)
                    if (!detectedData && ctx) {
                      const maxDim = 800;
                      let targetW = vW;
                      let targetH = vH;
                      if (targetW > maxDim || targetH > maxDim) {
                        const ratio = Math.min(maxDim / targetW, maxDim / targetH);
                        targetW = Math.floor(targetW * ratio);
                        targetH = Math.floor(targetH * ratio);
                      }
                      canvas.width = targetW;
                      canvas.height = targetH;
                      ctx.drawImage(video, 0, 0, targetW, targetH);
                      const fullImageData = ctx.getImageData(0, 0, targetW, targetH);

                      const fullCode = jsQR(fullImageData.data, targetW, targetH, {
                        inversionAttempts: "attemptBoth",
                      });
                      if (fullCode && fullCode.data && fullCode.data.trim()) {
                        detectedData = fullCode.data.trim();
                      }
                    }

                    // Trigger instant attendance verification if token detected
                    if (detectedData) {
                      if (
                        detectedData !== lastScannedTokenRef.current ||
                        now - lastScanTimestampRef.current > 2000
                      ) {
                        lastScannedTokenRef.current = detectedData;
                        lastScanTimestampRef.current = now;
                        processScannedToken(detectedData, true);
                      }
                    }
                  } catch (scanErr) {
                    console.warn("Scan frame error:", scanErr);
                  } finally {
                    isScanningRef.current = false;
                  }
                }
              }

              if (isMounted) {
                animationFrameId = requestAnimationFrame(scanFrame);
              }
            };

            animationFrameId = requestAnimationFrame(scanFrame);
          }
        } catch (err: any) {
          console.error("Camera access error:", err);
          toast.error("Camera access denied or camera not found on this device.");
          setCameraActive(false);
        }
      };

      initCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, sessionActive, facingMode, playScanConfirmationSound, playScanErrorSound]);

  const handleBatchSelectChange = (batchCode: string) => {
    setSelectedBatchCode(batchCode);
    const matched = batches.find((b) => (b.batchCode || b.name) === batchCode);
    if (matched) {
      setSelectedSubject(matched.subjectName || "");
      setSelectedBranch(matched.branch || "");
      setSelectedTrainer(matched.trainerName || "");
      setSelectedTiming(matched.classTiming || "");
      setSelectedDepartment(matched.departmentName || "Computer Science");
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
      setCameraActive(true); // Automatically enable camera on session start
      toast.success(
        `Attendance session STARTED for batch ${selectedBatchCode}! Camera scanner active.`,
      );
    } catch {
      setSessionActive(true);
      setCameraActive(true);
      toast.success(`Attendance session STARTED for ${selectedBatchCode}! Camera scanner active.`);
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
    await processScannedToken(qrInputToken, false);
  };

  const handleCopyRawPayload = () => {
    if (!scanResult?.rawToken) return;
    navigator.clipboard.writeText(scanResult.rawToken);
    setCopiedPayload(true);
    toast.success("Scanned QR Token Payload copied!");
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const absentCount = Math.max(totalStudents - presentCount, 0);
  const attendancePercentage =
    totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* SESSION STATUS BANNER */}
      {!sessionActive && (
        <Card className="border-rose-500/40 bg-rose-500/10">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
              <div>
                <strong className="text-sm font-bold text-foreground block">
                  Attendance Session is Currently STOPPED
                </strong>
                <p className="text-muted-foreground mt-0.5">
                  Click <strong>"Start Session"</strong> below to activate automatic camera QR
                  scanning and audio confirmation for {selectedBatchCode || "selected batch"}.
                </p>
              </div>
            </div>
            {/* <Button
              size="sm"
              className="gap-2 text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              onClick={handleStartSession}
              disabled={loading}
            >
              <Play className="h-4 w-4" /> Start Session Now
            </Button> */}
          </CardContent>
        </Card>
      )}

      {/* 1. SESSION CONFIGURATION BAR */}
      <Card className="border-border/60 shadow-sm bg-card">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Attendance Session Configuration
            </CardTitle>
            <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Active Batch
                </label>
                <span
                  className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded border border-primary/20"
                  title="Compact daily token valid today"
                >
                  {getDailyTokenForSubject(selectedBatchCode || "B01")}
                </span>
              </div>
              <select
                value={selectedBatchCode}
                onChange={(e) => handleBatchSelectChange(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-mono font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {batches.length > 0 ? (
                  batches.map((b) => (
                    <option key={b.id || b.batchCode} value={b.batchCode || b.name}>
                      {b.batchCode || b.name} — {b.subjectName || "Subject"} (
                      {b.departmentName || "Dept"})
                    </option>
                  ))
                ) : (
                  <option value="">
                    No batches available. Please create a batch in Batches page.
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Subject / Module
              </label>
              <Input
                value={selectedSubject || "—"}
                readOnly
                className="h-9 text-xs font-medium bg-muted/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">
                Trainer / Faculty
              </label>
              <Input
                value={selectedTrainer || "—"}
                readOnly
                className="h-9 text-xs font-medium bg-muted/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Class Timing</label>
              <Input
                value={selectedTiming || "—"}
                readOnly
                className="h-9 text-xs font-mono bg-muted/30"
              />
            </div>

            <div>
              {sessionActive ? (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold"
                  onClick={handleStopSession}
                  disabled={loading}
                >
                  <StopCircle className="h-4 w-4" /> Stop Session
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleStartSession}
                  disabled={loading}
                >
                  <Play className="h-4 w-4" /> Start Session
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. LIVE ATTENDANCE STATS COUNTER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/60 shadow-xs">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-primary" /> Total Registered Students
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{totalStudents}</div>
        </Card>
        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Present Today
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {presentCount}
          </div>
        </Card>
        <Card className="p-4 border border-rose-500/30 bg-rose-500/5 shadow-xs">
          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Absent</div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {absentCount}
          </div>
        </Card>
        <Card className="p-4 border border-primary/30 bg-primary/5 shadow-xs">
          <div className="text-xs text-primary font-semibold">Attendance Rate</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">
            {attendancePercentage}%
          </div>
        </Card>
      </div>

      {/* 3. CAMERA AUTOMATIC SCANNER & LAST SCANNED STUDENT PAYLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ENLARGED CAMERA SCANNER VIEWPORT */}
        <Card className="lg:col-span-6 border border-border/60 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> Automatic Camera QR Scanner
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Camera Lens Flip Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs gap-1 cursor-pointer"
                  disabled={!sessionActive || !cameraActive}
                  onClick={() => setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))}
                  title="Flip between Back and Front camera lenses"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {facingMode === "environment" ? "Back Lens" : "Front Lens"}
                </Button>

                {/* Audio Feedback Sound Toggle */}
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-7 px-2 text-xs gap-1 cursor-pointer ${soundEnabled ? "text-emerald-600 border-emerald-500/30" : "text-muted-foreground"}`}
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) playScanConfirmationSound();
                    toast.info(soundEnabled ? "Scan beep sound muted" : "Scan beep sound enabled");
                  }}
                  title={soundEnabled ? "Audio confirmation sound is ON" : "Audio sound is muted"}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}
                  {soundEnabled ? "Beep ON" : "Muted"}
                </Button>

                <Button
                  size="sm"
                  variant={cameraActive ? "default" : "outline"}
                  className="h-7 text-xs gap-1 cursor-pointer"
                  disabled={!sessionActive}
                  onClick={() => setCameraActive(!cameraActive)}
                >
                  <Camera className="h-3.5 w-3.5" />
                  {cameraActive ? "Pause Scanner" : "Enable Scanner"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Real HTML5 Camera Viewport with Automatic Recognition - Enlarged Viewport */}
            <div
              className={`relative w-full h-[480px] sm:h-[540px] md:h-[580px] rounded-3xl bg-slate-950 border overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-all duration-300 ${
                scanFlash
                  ? "border-emerald-500 ring-4 ring-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.6)]"
                  : "border-slate-800"
              }`}
            >
              <video
                ref={videoRef}
                className={`absolute inset-0 h-full w-full object-cover ${cameraActive && sessionActive ? "block" : "hidden"}`}
                playsInline
                muted
              />

              {cameraActive && sessionActive ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/60 pointer-events-none" />

                  {/* Top Status Beacon */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-full text-[11px] font-medium shadow-lg backdrop-blur-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Optical Decoder Active
                  </div>

                  {/* Enlarged QR Target Scanning Reticle Overlay */}
                  <div
                    className={`relative z-10 w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 border-2 rounded-3xl flex items-center justify-center pointer-events-none transition-all ${
                      scanFlash
                        ? "border-emerald-400 bg-emerald-500/20 scale-105"
                        : "border-primary/80 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                    }`}
                  >
                    <Scan
                      className={`w-20 h-20 transition-colors ${
                        scanFlash
                          ? "text-emerald-400 scale-110"
                          : "text-primary opacity-90 animate-pulse"
                      }`}
                    />
                    {/* Enlarged Crisp Corner Markers */}
                    <div className="absolute -top-3 -left-3 w-9 h-9 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute -top-3 -right-3 w-9 h-9 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute -bottom-3 -left-3 w-9 h-9 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute -bottom-3 -right-3 w-9 h-9 border-b-4 border-r-4 border-primary rounded-br-xl" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-3 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-bounce opacity-90 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  </div>

                  <p className="relative z-10 text-xs font-semibold text-slate-100 mt-6 bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 shadow-xl flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-spin" />
                    Point student QR code at center target — scans instantly
                  </p>
                </>
              ) : (
                <div className="text-slate-400 text-xs space-y-2.5">
                  <XCircle className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="font-semibold text-slate-300 text-base">
                    {sessionActive ? "Camera scanner is paused" : "Attendance Session Stopped"}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {sessionActive
                      ? 'Click "Enable Scanner" above to activate automatic camera recognition.'
                      : 'Click "Start Session" above to activate attendance taking.'}
                  </p>
                </div>
              )}
            </div>

            {/* SCAN TOKEN MANUAL INPUT FALLBACK */}
            <form onSubmit={handleScanTokenSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={
                    sessionActive
                      ? "Manual QR token verification (e.g. S16-SACH-48)..."
                      : "Session is stopped. Click Start Session above."
                  }
                  value={qrInputToken}
                  onChange={(e) => setQrInputToken(e.target.value)}
                  className="text-xs font-mono h-10 flex-1"
                  disabled={!sessionActive}
                />
                <Button
                  type="submit"
                  disabled={!sessionActive || loading || !qrInputToken.trim()}
                  className="gap-1.5 text-xs font-semibold h-10 px-5 shrink-0 cursor-pointer"
                >
                  <Scan className="h-4 w-4" /> Verify Token
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 4. LAST SCANNED STUDENT PAYLOAD SECTION */}
        <Card className="lg:col-span-6 border-border/60 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Last Scanned Student Payload
              </CardTitle>
              {scanResult?.success && (
                <Badge className="bg-emerald-600 text-white font-mono text-[10px] gap-1 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping inline-block" />{" "}
                  LIVE VERIFIED
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-center">
            {scanResult ? (
              scanResult.success ? (
                <div className="space-y-3.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 sm:p-5 text-left">
                  {/* Verified Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span>Attendance Confirmed & Logged</span>
                    </div>
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                      PRESENT ✓
                    </Badge>
                  </div>

                  {/* Student Identity Information */}
                  <div className="flex items-center gap-3 bg-background/80 p-3 rounded-xl border border-emerald-500/20">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-xs">
                      {scanResult.studentName?.charAt(0) || "S"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-foreground truncate">
                        {scanResult.studentName}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {scanResult.studentEmail}
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="font-mono text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded border border-primary/20">
                          USN: {scanResult.studentId}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {scanResult.department} • {scanResult.section}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Session Context Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-background/60 p-3 rounded-xl border border-emerald-500/20">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">
                        Batch Code & Subject
                      </span>
                      <strong className="text-primary font-mono">{scanResult.batchCode}</strong>
                      <span className="text-foreground text-[11px] block truncate font-medium">
                        {scanResult.subject}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">
                        Scan Timestamp
                      </span>
                      <strong className="text-foreground font-mono text-[11px] block">
                        {scanResult.time}
                      </strong>
                      <span className="text-muted-foreground text-[10px]">{scanResult.date}</span>
                    </div>
                  </div>

                  {/* Raw Scanned Payload Token Box */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                      <span>Raw Scanned QR Payload Token:</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] gap-1 px-1.5 text-primary hover:text-primary font-bold"
                        onClick={handleCopyRawPayload}
                      >
                        {copiedPayload ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copiedPayload ? "Copied" : "Copy Payload"}
                      </Button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border border-border font-mono text-xs text-foreground font-bold break-all select-all">
                      {scanResult.rawToken || "STU-TOKEN-VERIFIED"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Secure
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">
                      Verification: SUCCESS
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-left">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                    <AlertCircle className="h-5 w-5" /> Attendance Scan Rejected
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                    {scanResult.message}
                  </p>
                  {scanResult.rawToken && (
                    <div className="p-2 bg-background rounded-lg border text-xs font-mono text-rose-500 break-all">
                      Attempted token: {scanResult.rawToken}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center py-12 space-y-2 text-muted-foreground border border-dashed rounded-2xl">
                <Scan className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-bold text-foreground">Waiting for Student QR Scan</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  When a student points their QR code at the camera, attendance will be confirmed
                  with a chime and full student payload details will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. RECENT SCANNED SESSION ATTENDANCE LOGS */}
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Live Scanned Attendance Feed (
              {scannedList.length} Marked)
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Real-time feed of students confirmed in current attendance session.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          >
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs whitespace-nowrap">Student Name</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Batch Code</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Subject</TableHead>
                  <TableHead className="text-xs whitespace-nowrap">Scan Time</TableHead>
                  <TableHead className="text-right text-xs whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scannedList.length > 0 ? (
                  scannedList.map((r, i) => (
                    <TableRow key={r.id || i}>
                      <TableCell className="font-medium text-xs font-semibold whitespace-nowrap flex items-center gap-2">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          {(r.userName || r.userEmail || "S").charAt(0).toUpperCase()}
                        </div>
                        <span>{r.userName || r.userEmail}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-primary font-semibold whitespace-nowrap">
                        {selectedBatchCode || "BATCH-01"}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {r.subjectName || selectedSubject || "General Session"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(r.markedAt || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]">
                          {r.status || "PRESENT"} ✓
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      No student scans logged for current session yet. Click "Start Session" and
                      point student QR code at the camera.
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
