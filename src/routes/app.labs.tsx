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
  DialogFooter,
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
  FlaskConical,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Check,
  FileText,
  ShieldCheck,
  BookOpen,
  Users,
  Search,
  Sparkles,
  RefreshCw,
  Award,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  api,
  type LabItem,
  type LabAttendanceRecord,
  type DepartmentItem,
} from "@/lib/api-client";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/app/labs")({
  head: () => ({
    meta: [
      { title: "Lab Attendance — Smart Attendance" },
      {
        name: "description",
        content: "Simple and fast laboratory attendance and practical experiment tracking.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const { role } = useApp();

  return <>{role === "admin" ? <AdminEasyLabsView /> : <StudentEasyLabsView />}</>;
}

/* =========================================================================
   ADMINISTRATOR / TEACHER VIEW: SIMPLE 1-CLICK LAB ATTENDANCE
   ========================================================================= */
function AdminEasyLabsView() {
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [selectedLabCode, setSelectedLabCode] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<LabAttendanceRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter for history
  const [searchQuery, setSearchQuery] = useState("");

  // Add Lab Modal
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [newLabName, setNewLabName] = useState("");
  const [newLabCode, setNewLabCode] = useState("");
  const [newLabRoom, setNewLabRoom] = useState("");
  const [newLabFaculty, setNewLabFaculty] = useState("");
  const [newLabTiming, setNewLabTiming] = useState("02:00 PM - 05:00 PM");
  const [newLabExperiment, setNewLabExperiment] = useState("");

  // Verify Experiment Modal
  const [verifyingRecord, setVerifyingRecord] = useState<LabAttendanceRecord | null>(null);
  const [verifyMarks, setVerifyMarks] = useState<number>(10);
  const [verifyNotes, setVerifyNotes] = useState<string>("Code verified and executed successfully.");

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [labsData, deptsData, studentsData, attendanceData] = await Promise.all([
        api.getLabs(),
        api.getDepartments(),
        api.getStudents(),
        api.getLabAttendance(),
      ]);
      setLabs(labsData);
      setDepartments(deptsData);
      setStudents(studentsData);
      setRecords(attendanceData);

      if (labsData.length > 0 && !selectedLabCode) {
        setSelectedLabCode(labsData[0].code);
      }
    } catch (err: any) {
      console.error("Failed to load lab data:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedLabCode]);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const activeLab = labs.find((l) => l.code === selectedLabCode) || labs[0];
  const todayStr = new Date().toISOString().split("T")[0];

  // Mark student attendance for currently selected lab
  const handleMarkAttendance = async (student: any, status: "PRESENT" | "ABSENT") => {
    if (!activeLab) return;
    try {
      await api.markLabAttendance({
        labCode: activeLab.code,
        labName: activeLab.name,
        studentName: student.name,
        studentEmail: student.email,
        usn: student.usn,
        terminalNo: "STATION",
        experimentName: activeLab.currentExperiment,
        status: status,
        date: todayStr,
      });

      if (status === "PRESENT") {
        toast.success(`✓ Marked ${student.name} as PRESENT`);
      } else {
        toast.info(`Marked ${student.name} as ABSENT`);
      }
      loadData(true);
    } catch {
      toast.error("Failed to update attendance.");
    }
  };

  // Mark all students present with 1 click
  const handleMarkAllPresent = async () => {
    if (!activeLab || students.length === 0) return;
    try {
      await Promise.all(
        students.map((s) =>
          api.markLabAttendance({
            labCode: activeLab.code,
            labName: activeLab.name,
            studentName: s.name,
            studentEmail: s.email,
            usn: s.usn,
            terminalNo: "STATION",
            experimentName: activeLab.currentExperiment,
            status: "PRESENT",
            date: todayStr,
          }),
        ),
      );
      toast.success(`✓ Marked all ${students.length} students PRESENT for ${activeLab.code}!`);
      loadData(true);
    } catch {
      toast.error("Failed to mark all present.");
    }
  };

  // Save practical verification / sign off
  const handleSaveVerification = async () => {
    if (!verifyingRecord) return;
    try {
      await api.verifyLabExperiment(
        verifyingRecord.id,
        verifyMarks,
        "COMPLETED",
        verifyNotes,
      );
      toast.success(`✓ Signed off practical for ${verifyingRecord.studentName} (${verifyMarks}/10 Marks)!`);
      setVerifyingRecord(null);
      loadData(true);
    } catch {
      toast.error("Failed to sign off practical.");
    }
  };

  // Create Lab
  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName || !newLabCode) {
      toast.error("Please fill in Lab Name and Code.");
      return;
    }
    try {
      const created = await api.createLab({
        name: newLabName,
        code: newLabCode,
        labRoom: newLabRoom || "Practical Lab Room",
        facultyIncharge: newLabFaculty || "Faculty Lead",
        dayTiming: newLabTiming,
        currentExperiment: newLabExperiment || "Core Practical Experiment",
        department: "Computer Science",
      });
      toast.success(`Lab ${created.code} (${created.name}) created!`);
      setIsAddLabOpen(false);
      setNewLabName("");
      setNewLabCode("");
      setNewLabRoom("");
      setNewLabFaculty("");
      setNewLabExperiment("");
      loadData(false);
    } catch {
      toast.error("Failed to create lab.");
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (records.length === 0) {
      toast.info("No attendance records to export.");
      return;
    }
    const headers = ["Student Name", "USN", "Lab Code", "Lab Name", "Experiment", "Date", "Time", "Status", "Grade", "Remarks"];
    const rows = records.map((r) => [
      `"${r.studentName}"`,
      r.usn,
      r.labCode,
      `"${r.labName}"`,
      `"${r.experimentName}"`,
      r.date,
      r.inTime,
      r.status,
      r.facultyVerified ? `${r.marks ?? 10}/10` : "Pending",
      `"${r.feedback || ""}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lab_attendance_${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Lab attendance exported!");
  };

  const presentCount = records.filter((r) => r.status === "PRESENT" || r.status === "COMPLETED").length;
  const verifiedCount = records.filter((r) => r.facultyVerified).length;
  const totalCount = records.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  const filteredHistory = records.filter((r) => {
    return (
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.experimentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Attendance"
        subtitle="Take practical attendance, track student presence, and sign off lab experiments with one click."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={handleExportCsv}>
              <FileText className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setIsAddLabOpen(true)}>
              <Plus className="h-4 w-4" /> Add Lab
            </Button>
          </div>
        }
      />

      {/* 1. THREE SIMPLE SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-border/60 shadow-xs">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <FlaskConical className="h-3.5 w-3.5 text-primary" /> Active Labs
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{labs.length} Labs</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Configured practical courses</div>
        </Card>

        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Present Students
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {presentCount} Present
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Recorded practical presences</div>
        </Card>

        <Card className="p-4 border border-blue-500/30 bg-blue-500/5 shadow-xs">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> Verified Experiments
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {verifiedCount} Signed Off
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{attendanceRate}% Attendance rate</div>
        </Card>
      </div>

      {/* 2. SELECT LAB & 1-CLICK ATTENDANCE TAKER */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Quick Attendance Taker
              </CardTitle>
              <CardDescription className="text-xs">
                {labs.length > 0
                  ? "Select a lab below to mark student attendance and verify practical experiments."
                  : "No laboratories configured yet. Click 'Add Lab' to create your first practical laboratory unit."}
              </CardDescription>
            </div>
            {labs.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                onClick={handleMarkAllPresent}
              >
                <Check className="h-4 w-4" /> Mark All Students Present
              </Button>
            )}
          </div>

          {/* Lab Selector Buttons */}
          {labs.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1">
              {labs.map((lab) => {
                const isSelected = (activeLab?.code || "") === lab.code;
                return (
                  <button
                    key={lab.code}
                    onClick={() => setSelectedLabCode(lab.code)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border border-border/40"
                    }`}
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>{lab.code}</span>
                    <span className="opacity-80 text-[11px]">({lab.name.split(" ")[0]})</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {labs.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">No Laboratory Units Created</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Add your practical laboratory courses, faculty coordinators, and experiment tracks to start recording attendance.
                </p>
              </div>
              <Button size="sm" className="gap-1.5 text-xs font-bold" onClick={() => setIsAddLabOpen(true)}>
                <Plus className="h-4 w-4" /> Add Practical Lab
              </Button>
            </div>
          ) : (
            <>
              {/* Active Lab Information Banner */}
              {activeLab && (
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground text-sm flex items-center gap-2">
                      <span>{activeLab.name}</span>
                      <Badge variant="outline" className="font-mono text-[10px] bg-background">
                        {activeLab.code}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-primary" /> {activeLab.labRoom}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-primary" /> {activeLab.facultyIncharge}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {activeLab.dayTiming}
                      </span>
                    </div>
                  </div>
                  {activeLab.currentExperiment && (
                    <div className="px-3 py-1.5 rounded-lg bg-background border border-primary/20 shrink-0">
                      <span className="text-[10px] text-muted-foreground block font-semibold">Current Practical:</span>
                      <span className="font-semibold text-primary">{activeLab.currentExperiment}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Student Roster: 1-Click Present / Absent Actions */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground">Student Roster ({students.length} Students):</div>

                {students.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border/60 text-center text-xs text-muted-foreground">
                    No registered students found. Registered students will appear here automatically.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {students.map((student) => {
                      const studentLog = records.find(
                        (r) =>
                          r.labCode === activeLab?.code &&
                          (r.studentEmail.toLowerCase() === student.email.toLowerCase() ||
                            r.usn.toLowerCase() === student.usn.toLowerCase()),
                      );
                      const isPresent = studentLog?.status === "PRESENT" || studentLog?.status === "COMPLETED";
                      const isVerified = Boolean(studentLog?.facultyVerified);

                      return (
                        <div
                          key={student.id || student.email}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isPresent
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-border/60 bg-card hover:bg-muted/20"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-foreground truncate">{student.name}</div>
                            <div className="text-[11px] font-mono text-muted-foreground truncate">
                              {student.usn} • {student.department || "CS"}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isPresent ? (
                              <>
                                <Badge className="bg-emerald-600 text-white text-[10px] gap-1 py-0.5">
                                  <CheckCircle2 className="h-3 w-3" /> Present
                                </Badge>

                                <Button
                                  size="sm"
                                  variant={isVerified ? "outline" : "default"}
                                  className={`h-7 text-xs px-2.5 gap-1 font-semibold ${
                                    isVerified ? "border-emerald-500/40 text-emerald-600" : "bg-primary text-primary-foreground"
                                  }`}
                                  onClick={() => {
                                    if (studentLog) {
                                      setVerifyingRecord(studentLog);
                                      setVerifyMarks(studentLog.marks || 10);
                                      setVerifyNotes(studentLog.feedback || "Practical verified.");
                                    }
                                  }}
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  {isVerified ? "Edit Marks" : "Sign Off"}
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2.5 gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
                                onClick={() => handleMarkAttendance(student, "PRESENT")}
                              >
                                <Check className="h-3 w-3" /> Mark Present
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 3. RECENT LAB ATTENDANCE HISTORY TABLE */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Attendance Logbook
              </CardTitle>
              <CardDescription className="text-xs">
                History of student practical presences and faculty sign-off grades.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search student or lab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-bold">Student</TableHead>
                  <TableHead className="text-xs font-bold">Lab Subject</TableHead>
                  <TableHead className="text-xs font-bold">Practical Experiment</TableHead>
                  <TableHead className="text-xs font-bold">Date & Time</TableHead>
                  <TableHead className="text-xs font-bold">Attendance</TableHead>
                  <TableHead className="text-xs font-bold">Grade</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                      No attendance records found. Click "Present" on students above to log attendance.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-bold text-xs text-foreground">{r.studentName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{r.usn}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-semibold">{r.labCode}</div>
                        <div className="text-[10px] text-muted-foreground">{r.labName}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{r.experimentName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.date} • {r.inTime}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.facultyVerified ? (
                          <span className="font-mono text-xs font-bold text-emerald-600">
                            {r.marks ?? 10} / 10 Marks
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setVerifyingRecord(r);
                            setVerifyMarks(r.marks || 10);
                            setVerifyNotes(r.feedback || "Code verified and executed successfully.");
                          }}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {r.facultyVerified ? "Edit" : "Sign Off"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE NEW LAB MODAL */}
      <Dialog open={isAddLabOpen} onOpenChange={setIsAddLabOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FlaskConical className="h-5 w-5 text-primary" /> Add New Practical Lab
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter the lab subject name, venue, and faculty details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLab} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Lab Name *</Label>
              <Input
                placeholder="e.g. Python & Data Science Lab"
                value={newLabName}
                onChange={(e) => setNewLabName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Lab Code *</Label>
                <Input
                  placeholder="e.g. CS202L"
                  value={newLabCode}
                  onChange={(e) => setNewLabCode(e.target.value)}
                  required
                  className="h-9 text-xs font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Lab Room / Venue</Label>
                <Input
                  placeholder="e.g. Systems Lab 2"
                  value={newLabRoom}
                  onChange={(e) => setNewLabRoom(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Faculty In-Charge</Label>
                <Input
                  placeholder="e.g. Dr. Priya Sharma"
                  value={newLabFaculty}
                  onChange={(e) => setNewLabFaculty(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Timing</Label>
                <Input
                  placeholder="02:00 PM - 05:00 PM"
                  value={newLabTiming}
                  onChange={(e) => setNewLabTiming(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Current Active Experiment</Label>
              <Input
                placeholder="e.g. Exp 01: Pandas & Matplotlib Basics"
                value={newLabExperiment}
                onChange={(e) => setNewLabExperiment(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddLabOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                Save Lab Unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VERIFY / SIGN OFF EXPERIMENT MODAL */}
      <Dialog open={Boolean(verifyingRecord)} onOpenChange={(open) => !open && setVerifyingRecord(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Award className="h-5 w-5 text-emerald-600" /> Sign Off Practical Experiment
            </DialogTitle>
            <DialogDescription className="text-xs">
              Verify code execution and assign marks for {verifyingRecord?.studentName}.
            </DialogDescription>
          </DialogHeader>
          {verifyingRecord && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 font-mono space-y-1">
                <div>
                  <span className="text-muted-foreground">Student:</span> <strong>{verifyingRecord.studentName}</strong> ({verifyingRecord.usn})
                </div>
                <div>
                  <span className="text-muted-foreground">Lab Course:</span> <span className="text-primary font-bold">{verifyingRecord.labCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Experiment:</span> <span>{verifyingRecord.experimentName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Award Practical Marks (out of 10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={verifyMarks}
                  onChange={(e) => setVerifyMarks(parseInt(e.target.value) || 0)}
                  className="h-9 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Teacher Remarks</Label>
                <Input
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Code verified and runs without errors."
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setVerifyingRecord(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={handleSaveVerification}
                >
                  <Check className="h-4 w-4" /> Save Sign-off
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================================
   STUDENT VIEW: EASY LAB ATTENDANCE & PRACTICAL JOURNAL
   ========================================================================= */
function StudentEasyLabsView() {
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [summary, setSummary] = useState<{
    totalLabs: number;
    presentCount: number;
    absentCount: number;
    attendancePercentage: number;
    records: LabAttendanceRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStudentData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [labsData, summaryData] = await Promise.all([
        api.getLabs(),
        api.getStudentLabSummary(),
      ]);
      setLabs(labsData);
      setSummary(summaryData);
    } catch {
      // silent
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentData(false);
    const interval = setInterval(() => {
      loadStudentData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [loadStudentData]);

  const studentRecords = summary?.records || [];
  const primaryLab = labs[0];

  const handleSelfCheckin = async (lab: LabItem) => {
    try {
      await api.markLabAttendance({
        labCode: lab.code,
        labName: lab.name,
        experimentName: lab.currentExperiment,
        status: "PRESENT",
      });
      toast.success(`✓ Marked your attendance for ${lab.name}!`);
      loadStudentData(true);
    } catch {
      toast.error("Failed to mark attendance.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Lab Attendance"
        subtitle="Track your practical sessions, mark attendance, and view experiment grades."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => loadStudentData(false)}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        }
      />

      {/* 1. HERO ACTION CARD: TODAY'S LAB SESSION */}
      {primaryLab ? (
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
                  TODAY'S PRACTICAL
                </Badge>
                <span className="font-mono text-xs font-bold text-primary">{primaryLab.code}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground">{primaryLab.name}</h2>
              <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 pt-0.5">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> {primaryLab.labRoom}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {primaryLab.dayTiming}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-primary" /> {primaryLab.facultyIncharge}
                </span>
              </div>
              {primaryLab.currentExperiment && (
                <div className="text-xs font-semibold text-foreground pt-1">
                  Active Experiment: <span className="font-mono text-primary">{primaryLab.currentExperiment}</span>
                </div>
              )}
            </div>

            <Button
              size="lg"
              className="text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shrink-0 w-full sm:w-auto"
              onClick={() => handleSelfCheckin(primaryLab)}
            >
              <CheckCircle2 className="h-4 w-4" /> Mark My Lab Attendance
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-border/80 p-6 text-center shadow-xs">
          <div className="space-y-2 max-w-md mx-auto">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FlaskConical className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No Laboratory Sessions Scheduled</h3>
            <p className="text-xs text-muted-foreground">
              When practical laboratory sessions are published by your teachers, they will appear here for 1-click attendance check-in.
            </p>
          </div>
        </Card>
      )}

      {/* 2. ATTENDANCE SCORE & STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-border/60 shadow-xs">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <FlaskConical className="h-3.5 w-3.5 text-primary" /> Enrolled Lab Courses
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">{labs.length} Labs</div>
        </Card>

        <Card className="p-4 border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Practicals Attended
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {summary?.presentCount ?? 0} Sessions
          </div>
        </Card>

        <Card className="p-4 border border-blue-500/30 bg-blue-500/5 shadow-xs">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> Lab Attendance Rate
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {(summary?.attendancePercentage ?? 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">75% minimum required for exams</div>
        </Card>
      </div>

      {/* 3. PRACTICAL EXPERIMENTS JOURNAL TABLE */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> My Practical Experiments & Grades
          </CardTitle>
          <CardDescription className="text-xs">
            List of attended practical sessions, code submissions, and faculty sign-offs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-bold">Lab Course</TableHead>
                  <TableHead className="text-xs font-bold">Experiment Title</TableHead>
                  <TableHead className="text-xs font-bold">Date & Time</TableHead>
                  <TableHead className="text-xs font-bold">Attendance</TableHead>
                  <TableHead className="text-xs font-bold">Faculty Status</TableHead>
                  <TableHead className="text-xs font-bold">Awarded Grade</TableHead>
                  <TableHead className="text-xs font-bold">Teacher Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                      No lab records found yet. Click "Mark My Lab Attendance" above.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentRecords.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="text-xs font-bold text-foreground">{r.labCode}</div>
                        <div className="text-[10px] text-muted-foreground">{r.labName}</div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{r.experimentName}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.date} • {r.inTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                          Present ✓
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            r.facultyVerified
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {r.facultyVerified ? "Signed Off ✓" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {r.facultyVerified ? (
                          <span className="font-mono text-xs font-bold text-emerald-600">
                            {r.marks ?? 10} / 10 Marks
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground italic">
                        {r.feedback ? `"${r.feedback}"` : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
