import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Calendar, BarChart3, Users, Shield, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mentor Matrix — AI-Powered Student Mentoring System" },
      { name: "description", content: "Match students to the right mentors, schedule sessions, collect feedback, and analyze outcomes on a single modern platform." },
      { property: "og:title", content: "Mentor Matrix — AI-Powered Student Mentoring System" },
      { property: "og:description", content: "Match students to the right mentors, schedule sessions, and analyze outcomes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Mentor Matrix</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Sign in</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/register"><Button size="sm">Get started</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 gap-1"><Sparkles className="h-3 w-3" /> AI-Powered Mentor Matching</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Mentoring that moves students <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">forward</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            One platform for students, mentors, and administrators to match, schedule,
            collaborate, and measure the outcomes of every mentoring relationship.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/app/dashboard"><Button size="lg" className="gap-2">Open dashboard <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/register"><Button size="lg" variant="outline">Create free account</Button></Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> JWT secured</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Role-based access</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Spring Boot ready</span>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Smart Matching", body: "Recommend mentors by department, skills, interests, and capacity." },
            { icon: Calendar, title: "Conflict-free Scheduling", body: "Availability calendar with no double-booking." },
            { icon: BarChart3, title: "Outcome Analytics", body: "Track ratings, progress, and department-wise reports." },
            { icon: Shield, title: "Enterprise Security", body: "JWT auth, role-based access, audit-ready logs." },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
              <div className="mt-3 font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid gap-6 rounded-3xl border bg-card/60 p-6 backdrop-blur-xl sm:p-10 lg:grid-cols-3">
          {[
            { role: "Students", points: ["Find your best-fit mentor", "Book & reschedule easily", "Track progress and feedback"] },
            { role: "Mentors", points: ["Manage availability", "Approve requests fast", "Add notes & track students"] },
            { role: "Administrators", points: ["Assign & approve users", "Analytics dashboards", "Export PDF · Excel · CSV"] },
          ].map((r) => (
            <div key={r.role}>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary"><Star className="h-4 w-4" /> {r.role}</div>
              <ul className="mt-3 space-y-2 text-sm">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-background/60 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div>© {new Date().getFullYear()} Mentor Matrix. All rights reserved.</div>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
