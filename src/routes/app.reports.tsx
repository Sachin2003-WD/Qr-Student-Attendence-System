import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  api,
  type AttendanceResponse,
  type DepartmentItem,
  type DepartmentAttendanceData,
} from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Award,
  UserCheck,
  Calendar,
  Layers,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertTriangle,
  Users,
  CheckCircle2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({
    meta: [
      { title: "Department & Section Attendance Reports — Smart Attendance System" },
      {
        name: "description",
        content:
          "Real-time department-wise and section-wise student attendance reports, trend analytics, comparison, and exports.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportsAnalyticsPage,
});

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SECTIONS = ["ALL", "Section A", "Section B", "Section C", "Section D"];

function ReportsAnalyticsPage() {
  const { role, userEmail, userName } = useApp();
  const currentDate = new Date();

  // Active Report View Mode: "departments" or "sections"
  const [reportMode, setReportMode] = useState<"departments" | "sections">("departments");

  // Section & Month Filter State
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [thresholdFilter, setThresholdFilter] = useState<string>("ALL");
  const [sectionSearchQuery, setSectionSearchQuery] = useState<string>("");
  const [deptSearchQuery, setDeptSearchQuery] = useState<string>("");

  // Data States
  const [records, setRecords] = useState<AttendanceResponse[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [deptAttendanceData, setDeptAttendanceData] = useState<DepartmentAttendanceData[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 640);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  const fetchReportData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [reportLogs, studentsList, deptsList, deptStats, batchesList] = await Promise.all([
        api.getAttendanceReport(),
        api.getStudents(),
        api.getDepartments(),
        api.getDepartmentWiseAttendance(),
        api.getBatches(),
      ]);
      setRecords(reportLogs || []);
      setStudents(studentsList || []);
      setDepartments(deptsList || []);
      setDeptAttendanceData(deptStats || []);
      setBatches(batchesList || []);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Real-time 3s auto-sync & storage listener
  useEffect(() => {
    fetchReportData(false);
    const interval = setInterval(() => {
      fetchReportData(true);
    }, 3000);

    const handleStorage = () => fetchReportData(true);
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchReportData]);

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  /* ============================================================
     DEPARTMENT-WISE ATTENDANCE CALCULATIONS (REAL DATA ONLY)
     ============================================================ */
  const filteredDepartments = useMemo(() => {
    return deptAttendanceData.filter((d) => {
      const matchesFilter =
        selectedDeptFilter === "ALL" ||
        d.departmentName.toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
        d.departmentCode.toLowerCase() === selectedDeptFilter.toLowerCase();

      const q = deptSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.departmentName.toLowerCase().includes(q) ||
        d.departmentCode.toLowerCase().includes(q) ||
        (d.hodName && d.hodName.toLowerCase().includes(q)) ||
        (d.location && d.location.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [deptAttendanceData, selectedDeptFilter, deptSearchQuery]);

  // Overall Department KPIs
  const totalDeptCount = deptAttendanceData.length;
  const totalEnrolledStudents = useMemo(() => {
    return students.length;
  }, [students]);

  const totalAllDeptLogs = useMemo(() => {
    return deptAttendanceData.reduce((acc, d) => acc + d.totalAttendanceLogs, 0);
  }, [deptAttendanceData]);

  const totalAllDeptPresent = useMemo(() => {
    return deptAttendanceData.reduce((acc, d) => acc + d.presentCount, 0);
  }, [deptAttendanceData]);

  const overallDeptAttendancePct = useMemo(() => {
    if (totalAllDeptLogs === 0) return "0.0";
    return ((totalAllDeptPresent / totalAllDeptLogs) * 100).toFixed(1);
  }, [totalAllDeptLogs, totalAllDeptPresent]);

  const topPerformingDept = useMemo(() => {
    const withLogs = deptAttendanceData.filter((d) => d.totalAttendanceLogs > 0);
    if (withLogs.length === 0) return null;
    return withLogs.reduce((best, curr) =>
      curr.attendancePercentage > best.attendancePercentage ? curr : best,
    );
  }, [deptAttendanceData]);

  // Student specific department standing
  const currentStudentDeptData = useMemo(() => {
    if (role !== "student") return null;
    const cleanEmail = (userEmail || "").toLowerCase();
    const currentStudent = students.find(
      (s) => s.email?.toLowerCase() === cleanEmail || s.name === userName,
    );
    const stuDeptName = currentStudent?.department || "Computer Science";

    const matchedDept = deptAttendanceData.find(
      (d) =>
        d.departmentName.toLowerCase() === stuDeptName.toLowerCase() ||
        d.departmentCode.toLowerCase() === stuDeptName.toLowerCase() ||
        d.departmentName.toLowerCase().includes(stuDeptName.toLowerCase()),
    );

    // Calculate this student's individual logs
    const myLogs = records.filter(
      (r) => r.userEmail?.toLowerCase() === cleanEmail || r.userName === userName,
    );
    const myPresent = myLogs.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const myPct = myLogs.length > 0 ? ((myPresent / myLogs.length) * 100).toFixed(1) : "0.0";

    return {
      departmentName: matchedDept?.departmentName || stuDeptName,
      departmentCode: matchedDept?.departmentCode || "DEPT",
      deptAvgPct: matchedDept ? matchedDept.attendancePercentage : 0,
      myTotalLogs: myLogs.length,
      myPresentLogs: myPresent,
      myAttendancePct: myPct,
      hodName: matchedDept?.hodName || "Department Head",
    };
  }, [role, userEmail, userName, students, deptAttendanceData, records]);

  // Department Bar Chart Data for Recharts
  const deptChartData = useMemo(() => {
    return deptAttendanceData.map((d) => ({
      name: d.departmentCode || d.departmentName.slice(0, 4).toUpperCase(),
      fullName: d.departmentName,
      attendancePct: d.attendancePercentage,
      totalStudents: d.totalStudents,
      totalLogs: d.totalAttendanceLogs,
      presentCount: d.presentCount,
    }));
  }, [deptAttendanceData]);

  /* ============================================================
     MONTHLY SECTION-WISE ATTENDANCE CALCULATIONS
     ============================================================ */
  const monthlyLogs = useMemo(() => {
    return records.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [records, selectedYear, selectedMonth]);

  const filteredMonthlyLogs = useMemo(() => {
    return monthlyLogs.filter((r) => {
      const matchedStudent = students.find(
        (s) => s.email?.toLowerCase() === r.userEmail?.toLowerCase() || s.name === r.userName,
      );

      const stuSection =
        matchedStudent?.section || (matchedStudent?.id % 2 === 0 ? "Section B" : "Section A");
      const stuDept = matchedStudent?.department || "Computer Science";

      const matchesSection =
        selectedSection === "ALL" || stuSection.toLowerCase() === selectedSection.toLowerCase();
      const matchesDept =
        selectedDeptFilter === "ALL" ||
        stuDept.toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
        selectedDeptFilter.toLowerCase().includes(stuDept.toLowerCase());

      return matchesSection && matchesDept;
    });
  }, [monthlyLogs, students, selectedSection, selectedDeptFilter]);

  const sectionStats = useMemo(() => {
    const sectionsList = ["Section A", "Section B", "Section C", "Section D"];
    return sectionsList.map((secName) => {
      const secStudents = students.filter((s, sIdx) => {
        const studentSec = s.section || (sIdx % 2 === 0 ? "Section A" : "Section B");
        const matchesDept =
          selectedDeptFilter === "ALL" ||
          (s.department &&
            (s.department.toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
              selectedDeptFilter.toLowerCase().includes(s.department.toLowerCase())));
        return studentSec.toLowerCase() === secName.toLowerCase() && matchesDept;
      });

      const secEmails = new Set(secStudents.map((s) => s.email?.toLowerCase()));
      const secLogs = monthlyLogs.filter((r) => secEmails.has(r.userEmail?.toLowerCase() || ""));

      const totalLogs = secLogs.length;
      const presentLogs = secLogs.filter(
        (r) => r.status === "PRESENT" || r.status === "LATE",
      ).length;
      const absentLogs = secLogs.filter((r) => r.status === "ABSENT").length;
      const pct = totalLogs > 0 ? parseFloat(((presentLogs / totalLogs) * 100).toFixed(1)) : 0;

      return {
        sectionName: secName,
        totalStudents: secStudents.length,
        totalLogs,
        presentLogs,
        absentLogs,
        attendancePercentage: pct,
      };
    });
  }, [students, monthlyLogs, selectedDeptFilter]);

  // Daily Trend for Selected Month
  const dailyMonthlyTrend = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const trendMap: { [day: number]: { present: number; absent: number; total: number } } = {};

    for (let day = 1; day <= daysInMonth; day++) {
      trendMap[day] = { present: 0, absent: 0, total: 0 };
    }

    filteredMonthlyLogs.forEach((r) => {
      const d = new Date(r.date);
      const day = d.getDate();
      if (trendMap[day]) {
        if (r.status === "PRESENT" || r.status === "LATE") {
          trendMap[day].present += 1;
        } else {
          trendMap[day].absent += 1;
        }
        trendMap[day].total += 1;
      }
    });

    const monthAbbr = MONTH_NAMES[selectedMonth].slice(0, 3);
    return Object.entries(trendMap).map(([dayStr, val]) => ({
      day: `${monthAbbr} ${dayStr}`,
      dayNum: parseInt(dayStr, 10),
      Present: val.present,
      Absent: val.absent,
      Total: val.total,
    }));
  }, [filteredMonthlyLogs, selectedYear, selectedMonth]);

  // Student Monthly Register
  const studentMonthlyRegister = useMemo(() => {
    return students
      .map((s, idx) => {
        const studentSec = s.section || (idx % 2 === 0 ? "Section A" : "Section B");
        const studentDept = s.department || "Computer Science";
        const email = s.email || `student${s.id || idx + 1}@college.edu`;
        const usn = s.usn || `1RA21CS00${s.id || idx + 1}`;
        const name = s.name || email.split("@")[0];

        const stuMonthlyLogs = monthlyLogs.filter(
          (r) => r.userEmail?.toLowerCase() === email.toLowerCase() || r.userName === name,
        );

        const totalSessionsInMonth = stuMonthlyLogs.length;
        const presentDays = stuMonthlyLogs.filter(
          (r) => r.status === "PRESENT" || r.status === "LATE",
        ).length;
        const absentDays = stuMonthlyLogs.filter((r) => r.status === "ABSENT").length;
        const pct =
          totalSessionsInMonth > 0
            ? parseFloat(((presentDays / totalSessionsInMonth) * 100).toFixed(1))
            : 0;

        const isShortage = totalSessionsInMonth > 0 && pct < 75;
        const isDistinction = pct >= 85;

        return {
          id: s.id || idx,
          name,
          email,
          usn,
          department: studentDept,
          section: studentSec,
          totalSessions: totalSessionsInMonth,
          presentDays,
          absentDays,
          attendancePercentage: pct,
          isShortage,
          isDistinction,
        };
      })
      .filter((item) => {
        const matchesSection =
          selectedSection === "ALL" || item.section.toLowerCase() === selectedSection.toLowerCase();
        const matchesDept =
          selectedDeptFilter === "ALL" ||
          item.department.toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
          selectedDeptFilter.toLowerCase().includes(item.department.toLowerCase());

        const q = sectionSearchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.usn.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q);

        const matchesThreshold =
          thresholdFilter === "ALL" ||
          (thresholdFilter === "SHORTAGE" && item.isShortage) ||
          (thresholdFilter === "DISTINCTION" && item.isDistinction) ||
          (thresholdFilter === "REGULAR" &&
            item.attendancePercentage >= 75 &&
            item.attendancePercentage < 85);

        return matchesSection && matchesDept && matchesSearch && matchesThreshold;
      });
  }, [students, monthlyLogs, selectedSection, selectedDeptFilter, sectionSearchQuery, thresholdFilter]);

  const totalSectionStudentsFiltered = studentMonthlyRegister.length;
  const totalSectionMarkedLogs = filteredMonthlyLogs.length;
  const totalSectionPresentCount = filteredMonthlyLogs.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE",
  ).length;
  const overallMonthlySectionPct =
    totalSectionMarkedLogs > 0
      ? ((totalSectionPresentCount / totalSectionMarkedLogs) * 100).toFixed(1)
      : "0.0";
  const shortageCount = studentMonthlyRegister.filter((s) => s.isShortage).length;

  /* ============================================================
     EXPORT HANDLERS
     ============================================================ */
  const handleExportData = async (type: "pdf" | "excel" | "csv") => {
    setExporting(type);
    const dateStamp = new Date().toISOString().split("T")[0];

    try {
      if (reportMode === "departments") {
        const fileName = `Department_Attendance_Report_${dateStamp}`;
        if (type === "csv" || type === "excel") {
          let csvContent =
            "Department Name,Code,HOD,Location,Enrolled Students,Batches,Attendance Logs,Present,Absent,Attendance %\n";
          filteredDepartments.forEach((d) => {
            csvContent += `"${d.departmentName}","${d.departmentCode}","${d.hodName || ""}","${d.location || ""}",${d.totalStudents},${d.totalBatches || 0},${d.totalAttendanceLogs},${d.presentCount},${d.absentCount},"${d.attendancePercentage}%"\n`;
          });
          const mime = type === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
          const blob = new Blob([csvContent], { type: mime });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${fileName}.${type === "csv" ? "csv" : "xlsx"}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`Exported ${fileName} successfully!`);
        } else {
          window.print();
          toast.success(`Department report prepared for PDF printing!`);
        }
      } else {
        const monthName = MONTH_NAMES[selectedMonth];
        const fileName = `Monthly_Section_Report_${monthName}_${selectedYear}_${selectedSection.replace(" ", "_")}`;
        if (type === "csv" || type === "excel") {
          let csvContent =
            "Student Name,USN / ID,Department,Section,Total Sessions,Present Days,Absent Days,Monthly Attendance %\n";
          studentMonthlyRegister.forEach((s) => {
            csvContent += `"${s.name}","${s.usn}","${s.department}","${s.section}",${s.totalSessions},${s.presentDays},${s.absentDays},"${s.attendancePercentage}%"\n`;
          });
          const mime = type === "csv" ? "text/csv;charset=utf-8;" : "application/vnd.ms-excel";
          const blob = new Blob([csvContent], { type: mime });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${fileName}.${type === "csv" ? "csv" : "xlsx"}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`Exported ${fileName} successfully!`);
        } else {
          window.print();
          toast.success(`Section report prepared for PDF printing!`);
        }
      }
    } catch {
      toast.error(`Failed to export ${type.toUpperCase()} report.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          reportMode === "departments"
            ? "Department-Wise Attendance Reports"
            : "Monthly Section-Wise Attendance Reports"
        }
        subtitle={
          role === "student"
            ? "Inspect your academic department's standing, subject attendance ratios, and verified monthly registers."
            : "Institution-wide academic department metrics, live attendance rates, cross-section comparisons, and exportable registers."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => fetchReportData(false)}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Live Sync (3s)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => handleExportData("pdf")}
              disabled={exporting === "pdf"}
            >
              <FileText className="h-3.5 w-3.5 text-rose-500" />
              {exporting === "pdf" ? "Exporting..." : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => handleExportData("excel")}
              disabled={exporting === "excel"}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              {exporting === "excel" ? "Exporting..." : "Export Excel"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => handleExportData("csv")}
              disabled={exporting === "csv"}
            >
              <FileDown className="h-3.5 w-3.5 text-sky-500" />
              {exporting === "csv" ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        }
      />

      {/* REPORT TYPE SWITCHER TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/70 rounded-2xl border border-border/40 w-fit">
        <button
          onClick={() => setReportMode("departments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportMode === "departments"
              ? "bg-background text-primary shadow-xs ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4 text-primary" />
          Department-Wise Attendance Report
        </button>
        <button
          onClick={() => setReportMode("sections")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportMode === "sections"
              ? "bg-background text-primary shadow-xs ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4 text-primary" />
          Monthly Section-Wise Register
        </button>
      </div>

      {/* ============================================================
          VIEW 1: DEPARTMENT-WISE ATTENDANCE REPORT
          ============================================================ */}
      {reportMode === "departments" && (
        <div className="space-y-6">
          {/* STUDENT PERSONALISED DEPARTMENT CARD */}
          {role === "student" && currentStudentDeptData && (
            <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-md">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {currentStudentDeptData.departmentName}
                      </h3>
                      <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-[10px]">
                        {currentStudentDeptData.departmentCode}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      HOD: <strong>{currentStudentDeptData.hodName}</strong> • Logged as: {userName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">
                      Your Attendance Rate
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {currentStudentDeptData.myAttendancePct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {currentStudentDeptData.myPresentLogs} / {currentStudentDeptData.myTotalLogs} sessions
                    </span>
                  </div>
                  <div className="h-10 w-[1px] bg-border/60" />
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">
                      Department Average
                    </span>
                    <span className="text-2xl font-bold font-mono text-primary">
                      {currentStudentDeptData.deptAvgPct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      All enrolled peers
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* DEPARTMENT KPI STAT CARDS */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Active Departments
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {totalDeptCount}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Academic divisions tracked
                  </span>
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
                    Overall Academic Attendance
                  </span>
                  <div className="text-2xl font-bold text-emerald-600 font-mono">
                    {overallDeptAttendancePct}%
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {totalAllDeptPresent} / {totalAllDeptLogs} total verified logs
                  </span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Enrolled Students
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {totalEnrolledStudents}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Across all college departments
                  </span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Top Department
                  </span>
                  <div className="text-xl font-bold text-foreground truncate">
                    {topPerformingDept ? topPerformingDept.departmentCode : "None"}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold font-mono">
                    {topPerformingDept ? `${topPerformingDept.attendancePercentage}% Attendance` : "No logs recorded"}
                  </span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                  <Award className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DEPARTMENT ATTENDANCE COMPARISON CHART */}
          <Card className="border-border/60 bg-card shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-semibold">
                    Department-Wise Attendance Rate Comparison (%)
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Live Computed
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Real-time verified presence rate compared across all academic departments.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={isMobile ? 9 : 11} stroke="currentColor" opacity={0.7} />
                  <YAxis domain={[0, 100]} fontSize={isMobile ? 9 : 11} stroke="currentColor" opacity={0.7} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                  <Bar
                    dataKey="attendancePct"
                    name="Attendance Rate %"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* DEPARTMENT FILTER & SEARCH BAR */}
          <Card className="border-border/60 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search department name, code, or HOD..."
                  value={deptSearchQuery}
                  onChange={(e) => setDeptSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="h-9 text-xs bg-muted border-0 rounded-lg px-3 text-foreground font-semibold focus:outline-none w-full sm:w-auto"
                >
                  <option value="ALL">All Academic Departments</option>
                  {departments.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DEPARTMENT DATA ROSTER TABLE */}
            <div className="w-full overflow-x-auto mt-4">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Department Name & Code</TableHead>
                    <TableHead className="text-xs">Head of Department (HOD)</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs text-center">Enrolled Students</TableHead>
                    <TableHead className="text-xs text-center">Active Batches</TableHead>
                    <TableHead className="text-xs text-center">Attendance Logs</TableHead>
                    <TableHead className="text-xs text-center">Present / Absent</TableHead>
                    <TableHead className="text-xs text-right">Attendance %</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground animate-pulse">
                        Loading department attendance data...
                      </TableCell>
                    </TableRow>
                  ) : filteredDepartments.length > 0 ? (
                    filteredDepartments.map((d) => {
                      const pct = d.attendancePercentage;
                      const hasLogs = d.totalAttendanceLogs > 0;
                      const isHigh = hasLogs && pct >= 85;
                      const isMed = hasLogs && pct >= 75 && pct < 85;

                      return (
                        <TableRow key={d.departmentId}>
                          <TableCell className="text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold font-mono text-[11px]">
                                {d.departmentCode.slice(0, 3)}
                              </div>
                              <div>
                                <div className="text-foreground">{d.departmentName}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{d.departmentCode}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.hodName || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{d.location || "—"}</TableCell>
                          <TableCell className="text-xs text-center font-mono font-bold">{d.totalStudents}</TableCell>
                          <TableCell className="text-xs text-center font-mono">{d.totalBatches || 0}</TableCell>
                          <TableCell className="text-xs text-center font-mono font-semibold">{d.totalAttendanceLogs}</TableCell>
                          <TableCell className="text-xs text-center font-mono text-muted-foreground">
                            <span className="text-emerald-600 font-bold">{d.presentCount}</span> /{" "}
                            <span className="text-rose-600 font-bold">{d.absentCount}</span>
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            <div className="font-bold font-mono text-sm text-foreground">{pct}%</div>
                            <Progress
                              value={pct}
                              className={`h-1.5 w-16 ml-auto mt-1 rounded-full ${
                                isHigh
                                  ? "[&>div]:bg-emerald-600"
                                  : isMed
                                    ? "[&>div]:bg-amber-500"
                                    : hasLogs
                                      ? "[&>div]:bg-rose-500"
                                      : "[&>div]:bg-slate-400"
                              }`}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={`text-[9px] font-bold border-none px-2 py-0.5 ${
                                !hasLogs
                                  ? "bg-slate-500/10 text-slate-500"
                                  : isHigh
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : isMed
                                      ? "bg-amber-500/10 text-amber-600"
                                      : "bg-rose-500/10 text-rose-600"
                              }`}
                            >
                              {!hasLogs ? "NO LOGS" : isHigh ? "EXCELLENT" : isMed ? "GOOD" : "ATTENTION"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                        No departments found matching the filter criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================
          VIEW 2: MONTHLY SECTION-WISE ATTENDANCE REGISTER
          ============================================================ */}
      {reportMode === "sections" && (
        <div className="space-y-6">
          {/* MONTH & YEAR CONTROLLER CARD */}
          <Card className="border-border/60 shadow-xs bg-card p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">
                      {MONTH_NAMES[selectedMonth]} {selectedYear}
                    </h2>
                    <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">
                      {selectedSection}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing real-time monthly section attendance and performance metrics.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-muted p-1 rounded-xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-xs font-bold font-mono text-foreground">
                    {MONTH_NAMES[selectedMonth].slice(0, 3)} {selectedYear}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="h-8 text-xs bg-background border border-border rounded-lg px-2.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="h-8 text-xs bg-background border border-border rounded-lg px-2.5 text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION FILTER TABS */}
            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-border/40 overflow-x-auto">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                <Layers className="h-3.5 w-3.5 text-primary" /> Section Filter:
              </span>
              {SECTIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
                    selectedSection === sec
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sec}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2 shrink-0">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="h-7 text-xs bg-muted border-0 rounded-md px-2 text-foreground font-medium focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* MONTHLY SECTION KPI STAT CARDS */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Monthly Attendance Rate
                  </span>
                  <div className="text-2xl font-bold text-emerald-600">
                    {overallMonthlySectionPct}%
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {totalSectionPresentCount} / {totalSectionMarkedLogs} present sessions
                  </span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Section Logs
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {totalSectionMarkedLogs}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    in {MONTH_NAMES[selectedMonth]} {selectedYear}
                  </span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Layers className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Enrolled in Section
                  </span>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {totalSectionStudentsFiltered}
                  </div>
                  <span className="text-[11px] text-muted-foreground">Active registered roster</span>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Attendance Shortage (&lt;75%)
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      shortageCount > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {shortageCount} Students
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {shortageCount > 0
                      ? "Requires attendance intervention"
                      : "All students in good standing"}
                  </span>
                </div>
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    shortageCount > 0
                      ? "bg-rose-500/10 text-rose-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION PERFORMANCE BREAKDOWN CARDS */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Section-Wise Monthly Performance Breakdown
            </h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {sectionStats.map((sec) => {
                const isSelected = selectedSection === sec.sectionName;
                const pct = sec.attendancePercentage;
                const isHigh = pct >= 85;
                const isMed = pct >= 75 && pct < 85;

                return (
                  <Card
                    key={sec.sectionName}
                    onClick={() => setSelectedSection(isSelected ? "ALL" : sec.sectionName)}
                    className={`p-4 border transition-all cursor-pointer rounded-2xl ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 bg-primary/5 shadow-xs"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground font-mono">
                        {sec.sectionName}
                      </span>
                      <Badge
                        className={`text-[9px] font-bold border-none px-1.5 py-0.5 ${
                          isHigh
                            ? "bg-emerald-500/10 text-emerald-600"
                            : isMed
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {isHigh ? "EXCELLENT" : isMed ? "GOOD" : "ATTENTION"}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-bold font-mono text-foreground">{pct}%</span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {sec.presentLogs} / {sec.totalLogs} logs
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-1.5 mt-2 rounded-full ${
                        isHigh
                          ? "[&>div]:bg-emerald-600"
                          : isMed
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-rose-500"
                      }`}
                    />
                    <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground">
                      <span>{sec.totalStudents} Enrolled</span>
                      <span>{sec.absentLogs} Absent Days</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CHARTS: DAILY PROGRESSION & SECTION COMPARISON */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">
                      Daily Attendance Progression ({MONTH_NAMES[selectedMonth]} {selectedYear})
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedSection}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Daily student attendance count recorded across each calendar day of this month.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyMonthlyTrend}>
                    <defs>
                      <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="day"
                      fontSize={isMobile ? 8 : 10}
                      stroke="currentColor"
                      opacity={0.7}
                    />
                    <YAxis fontSize={isMobile ? 9 : 11} stroke="currentColor" opacity={0.7} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                    <Area
                      type="monotone"
                      dataKey="Present"
                      stroke="#10b981"
                      fill="url(#presentGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="Absent"
                      stroke="#ef4444"
                      fill="#ef444420"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-base font-semibold">
                    Section Attendance Comparison Rate (%)
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Side-by-side performance rate across Section A, B, C, and D for{" "}
                  {MONTH_NAMES[selectedMonth]}.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionStats}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="sectionName"
                      fontSize={isMobile ? 9 : 11}
                      stroke="currentColor"
                      opacity={0.7}
                    />
                    <YAxis
                      domain={[0, 100]}
                      fontSize={isMobile ? 9 : 11}
                      stroke="currentColor"
                      opacity={0.7}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#f8fafc",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
                    <Bar
                      dataKey="attendancePercentage"
                      name="Attendance Rate %"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* DETAILED MONTHLY SECTION REGISTER TABLE */}
          <Card className="border-border/60 p-4 shadow-xs">
            <CardHeader className="px-0 pt-0 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" /> Monthly Section-Wise Attendance Register
                </CardTitle>
                <CardDescription className="text-xs">
                  Student roster for {MONTH_NAMES[selectedMonth]} {selectedYear} ({selectedSection})
                  — Total Days, Present, Absent, and Percentage.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setThresholdFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      thresholdFilter === "ALL"
                        ? "bg-background text-foreground shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Roster
                  </button>
                  <button
                    onClick={() => setThresholdFilter("SHORTAGE")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all text-rose-600 ${
                      thresholdFilter === "SHORTAGE"
                        ? "bg-background text-rose-600 shadow-xs font-bold"
                        : "hover:text-rose-600"
                    }`}
                  >
                    Shortage (&lt;75%)
                  </button>
                  <button
                    onClick={() => setThresholdFilter("DISTINCTION")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all text-emerald-600 ${
                      thresholdFilter === "DISTINCTION"
                        ? "bg-background text-emerald-600 shadow-xs font-bold"
                        : "hover:text-emerald-600"
                    }`}
                  >
                    Distinction (≥85%)
                  </button>
                </div>
              </div>
            </CardHeader>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student by name, USN, email, or department in this section..."
                value={sectionSearchQuery}
                onChange={(e) => setSectionSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="w-full overflow-x-auto">
              <Table className="min-w-[650px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student Details</TableHead>
                    <TableHead className="text-xs">USN / ID</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Section</TableHead>
                    <TableHead className="text-xs text-center">Total Sessions</TableHead>
                    <TableHead className="text-xs text-center">Present Days</TableHead>
                    <TableHead className="text-xs text-center">Absent Days</TableHead>
                    <TableHead className="text-xs text-right">Monthly %</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground animate-pulse">
                        Loading student attendance register...
                      </TableCell>
                    </TableRow>
                  ) : studentMonthlyRegister.length > 0 ? (
                    studentMonthlyRegister.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-semibold">
                          <div className="text-foreground">{s.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{s.email}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-semibold text-primary">{s.usn}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.department}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {s.section}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-center font-mono font-bold">{s.totalSessions}</TableCell>
                        <TableCell className="text-xs text-center font-mono text-emerald-600 font-bold">
                          {s.presentDays}
                        </TableCell>
                        <TableCell className="text-xs text-center font-mono text-rose-600 font-bold">
                          {s.absentDays}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <div className="font-bold font-mono text-sm text-foreground">{s.attendancePercentage}%</div>
                          <Progress
                            value={s.attendancePercentage}
                            className={`h-1.5 w-16 ml-auto mt-1 rounded-full ${
                              s.isDistinction
                                ? "[&>div]:bg-emerald-600"
                                : s.isShortage
                                  ? "[&>div]:bg-rose-500"
                                  : "[&>div]:bg-amber-500"
                            }`}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`text-[9px] font-bold border-none px-2 py-0.5 ${
                              s.isDistinction
                                ? "bg-emerald-500/10 text-emerald-600"
                                : s.isShortage
                                  ? "bg-rose-500/10 text-rose-600"
                                  : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {s.isDistinction ? "DISTINCTION" : s.isShortage ? "SHORTAGE" : "REGULAR"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                        No students found matching the selected criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
