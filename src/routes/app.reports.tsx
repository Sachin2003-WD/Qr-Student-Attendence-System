import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { monthlySessions, deptDistribution, ratingTrend, mentors, students } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Mentor Matrix" },
      { name: "description", content: "Analytics and reports across the mentoring program." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reports,
});

function Reports() {
  const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-primary)"];
  return (
    <>
      <PageHeader
        title="Reports & analytics"
        subtitle="Session volume, department breakdowns, and top performers."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success("Exported PDF")}><FileText className="h-4 w-4" /> PDF</Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success("Exported Excel")}><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success("Exported CSV")}><FileDown className="h-4 w-4" /> CSV</Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly sessions</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySessions}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="sessions" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sessions by department</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptDistribution} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3} label={{ fontSize: 11 }}>
                  {deptDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average rating trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="week" fontSize={12} /><YAxis domain={[3.5, 5]} fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="rating" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Volume trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySessions}>
                <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="sessions" stroke="var(--color-chart-2)" fill="url(#ga)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top mentors</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Dept</TableHead><TableHead>Rating</TableHead><TableHead>Students</TableHead></TableRow></TableHeader>
              <TableBody>
                {[...mentors].sort((a, b) => b.rating - a.rating).slice(0, 5).map((m) => (
                  <TableRow key={m.id}><TableCell className="font-medium">{m.name}</TableCell><TableCell className="text-sm text-muted-foreground">{m.department}</TableCell><TableCell>{m.rating} ★</TableCell><TableCell>{m.students}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Most active students</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Dept</TableHead><TableHead>Progress</TableHead></TableRow></TableHeader>
              <TableBody>
                {[...students].sort((a, b) => b.progress - a.progress).slice(0, 5).map((s) => (
                  <TableRow key={s.id}><TableCell className="font-medium">{s.name}</TableCell><TableCell className="text-sm text-muted-foreground">{s.department}</TableCell><TableCell>{s.progress}%</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
