import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api-client";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { FileDown, FileSpreadsheet, FileText, RefreshCw, BarChart3, PieChart as PieIcon, TrendingUp, Activity, Award, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Smart Attendance System" },
      { name: "description", content: "Real-time analytics, yearly sessions, department breakdowns, and exportable reports." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reports,
});

function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.getReportsAnalytics();
      if (res) {
        setData(res);
      }
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Real-time automatic background polling every 5 seconds & storage listener
  useEffect(() => {
    fetchAnalytics(false);
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 5000);

    const handleStorageEvent = () => fetchAnalytics(true);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [fetchAnalytics]);

  const handleExport = async (type: "pdf" | "excel" | "csv") => {
    setExporting(type);
    try {
      if (type === "pdf") await api.exportPdfReport();
      else if (type === "excel") await api.exportExcelReport();
      else if (type === "csv") await api.exportCsvReport();
      toast.success(`${type.toUpperCase()} report generated & downloaded successfully`);
    } catch (err: any) {
      toast.error(err.message || `Failed to export ${type.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

  const yearlyData = data?.yearlySessions || data?.monthlySessions || [];
  const deptData = data?.deptDistribution || [];
  const ratingData = data?.ratingTrend || [];
  const topMentors = data?.topMentors || [];
  const activeStudents = data?.activeStudents || [];

  return (
    <>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive live performance metrics, academic session volume, department breakdowns, and exportable reports."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => fetchAnalytics(false)}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Live Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => handleExport("pdf")}
              disabled={exporting === "pdf"}
            >
              <FileText className="h-3.5 w-3.5 text-rose-500" />
              {exporting === "pdf" ? "Exporting PDF..." : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => handleExport("excel")}
              disabled={exporting === "excel"}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              {exporting === "excel" ? "Export Excel..." : "Export Excel"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => handleExport("csv")}
              disabled={exporting === "csv"}
            >
              <FileDown className="h-3.5 w-3.5 text-sky-500" />
              {exporting === "csv" ? "Export CSV..." : "Export CSV"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Yearly Sessions */}
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">Yearly Sessions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Tracks total academic sessions created versus completed across calendar years.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {yearlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="year" fontSize={11} stroke="currentColor" opacity={0.7} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.7} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="sessions" name="Sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No yearly session records found in MySQL database.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Sessions by Department */}
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Sessions by Department</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Percentage breakdown of student enrollment and session distribution across departments.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {deptData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "8px 12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
                    }}
                    itemStyle={{ color: "#ffffff", fontWeight: 600 }}
                    labelStyle={{ color: "#ffffff", fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No department distribution data available in MySQL database.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Average Rating Trend */}
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-base font-semibold">Average Rating Trend</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Weekly average rating metrics collected from student feedback and attendance satisfaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {ratingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="week" fontSize={11} stroke="currentColor" opacity={0.7} />
                  <YAxis domain={[3.5, 5]} fontSize={11} stroke="currentColor" opacity={0.7} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    name="Rating"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No rating trend data found in MySQL database.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Volume Trend */}
        <Card className="border-border/60 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Volume Trend</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Yearly progression and volume growth of active attendance logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {yearlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyData}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="year" fontSize={11} stroke="currentColor" opacity={0.7} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.7} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      fontSize: "12px",
                      fontWeight: 600,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
                    }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Session Volume"
                    stroke="#10b981"
                    fill="url(#volGrad)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No volume trend metrics recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 5. Top Mentors Table */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base font-semibold">Top Mentors</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Highest-performing mentors categorized by academic department and student counts.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {topMentors.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Dept</TableHead>
                      <TableHead className="text-xs">Rating</TableHead>
                      <TableHead className="text-xs text-right">Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMentors.map((m: any, idx: number) => (
                      <TableRow key={m.id || idx} className="border-border/30">
                        <TableCell className="text-xs font-semibold">{m.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.department}</TableCell>
                        <TableCell className="text-xs font-medium text-amber-500">{m.rating} ★</TableCell>
                        <TableCell className="text-xs text-right font-mono font-medium">{m.students}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No registered mentor records found in MySQL database.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6. Most Active Students Table */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-base font-semibold">Most Active Students</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Top participating students ranked by session attendance percentage and active progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {activeStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Dept</TableHead>
                      <TableHead className="text-xs text-right">Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStudents.map((s: any, idx: number) => (
                      <TableRow key={s.id || idx} className="border-border/30">
                        <TableCell className="text-xs font-semibold">{s.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.department}</TableCell>
                        <TableCell className="text-xs text-right font-mono font-semibold text-emerald-500">
                          {s.progress}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active student records found in MySQL database.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
