import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarClock, ClipboardList, Star, GraduationCap, Users, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/app-context";
import { sessions, mentors, students, monthlySessions, deptDistribution, ratingTrend, mentorName, studentName, feedback } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mentor Matrix" },
      { name: "description", content: "Your mentoring overview: sessions, feedback, and progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { role, userName } = useApp();
  return (
    <>
      <PageHeader
        title={`Good day, ${userName.split(" ")[0]}`}
        subtitle={role === "student" ? "Here's your mentoring snapshot." : role === "mentor" ? "Your students and sessions today." : "Institution-wide mentoring analytics."}
        actions={role === "student" ? <Link to="/app/schedule"><Button>Book a session</Button></Link> : role === "admin" ? <Link to="/app/reports"><Button>View reports</Button></Link> : undefined}
      />
      {role === "student" && <StudentDash />}
      {role === "mentor" && <MentorDash />}
      {role === "admin" && <AdminDash />}
    </>
  );
}

function StudentDash() {
  const upcoming = sessions.filter((s) => s.status === "upcoming");
  const pending = sessions.filter((s) => s.status === "pending");
  const completed = sessions.filter((s) => s.status === "completed");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming" value={upcoming.length} icon={CalendarCheck} delta="Next: today" />
        <StatCard label="Pending" value={pending.length} icon={CalendarClock} accent="chart-4" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} accent="chart-3" />
        <StatCard label="Progress" value="82%" icon={TrendingUp} accent="chart-2" delta="+6% this month" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ratingTrend}>
                <defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" fontSize={12} /><YAxis domain={[3.5, 5]} fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="rating" stroke="var(--color-chart-1)" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Assigned mentor</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary font-semibold">PS</AvatarFallback></Avatar>
              <div className="min-w-0">
                <div className="font-semibold">Dr. Priya Sharma</div>
                <div className="text-xs text-muted-foreground">Computer Science</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Rating</span><span className="font-medium text-foreground">4.9 ★</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Sessions</span><span className="font-medium text-foreground">7 completed</span></div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Semester goal</span><span>82%</span></div>
                <Progress value={82} />
              </div>
            </div>
            <Link to="/app/mentors" className="mt-4 inline-block text-sm text-primary hover:underline">View mentor details →</Link>
          </CardContent>
        </Card>
      </div>
      <UpcomingList />
      <RecentFeedback />
    </div>
  );
}

function MentorDash() {
  const today = new Date().toISOString().slice(0, 10);
  const todays = sessions.filter((s) => s.date === today);
  const requests = sessions.filter((s) => s.status === "pending");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's sessions" value={todays.length} icon={CalendarCheck} />
        <StatCard label="Pending requests" value={requests.length} icon={AlertCircle} accent="chart-4" />
        <StatCard label="Students" value={12} icon={Users} accent="chart-2" />
        <StatCard label="Avg. rating" value="4.9" icon={Star} accent="chart-3" delta="Last 30 days" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Sessions per month</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySessions}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="sessions" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {requests.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{s.topic}</div>
                  <div className="truncate text-xs text-muted-foreground">{studentName(s.student)} · {s.date} {s.time}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost">Reject</Button>
                  <Button size="sm">Accept</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <UpcomingList />
    </div>
  );
}

function AdminDash() {
  const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary)"];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={students.length * 42} icon={Users} />
        <StatCard label="Mentors" value={mentors.length * 8} icon={GraduationCap} accent="chart-2" />
        <StatCard label="Total sessions" value="1,284" icon={CalendarCheck} accent="chart-3" delta="+12% MoM" />
        <StatCard label="Pending requests" value={sessions.filter(s => s.status === "pending").length} icon={ClipboardList} accent="chart-4" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly sessions</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySessions}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="sessions" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>By department</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptDistribution} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {deptDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <RecentFeedback />
    </div>
  );
}

function UpcomingList() {
  const upcoming = sessions.filter((s) => s.status === "upcoming" || s.status === "pending").slice(0, 5);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming sessions</CardTitle>
        <Link to="/app/sessions" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {upcoming.map((s) => (
          <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border p-3 sm:flex sm:justify-between">
            <div className="min-w-0">
              <div className="truncate font-medium">{s.topic}</div>
              <div className="truncate text-xs text-muted-foreground">{mentorName(s.mentor)} · {studentName(s.student)}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right text-xs text-muted-foreground">{s.date}<br />{s.time}</div>
              <Badge variant={s.status === "pending" ? "secondary" : "default"}>{s.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentFeedback() {
  return (
    <Card>
      <CardHeader><CardTitle>Recent feedback</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {feedback.map((f) => (
          <div key={f.id} className="rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{studentName(f.from)} → {mentorName(f.to)}</span>
              <span className="ml-auto text-xs text-chart-4">{"★".repeat(f.rating)}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">"{f.comment}"</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
