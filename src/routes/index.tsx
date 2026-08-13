import { createFileRoute, Link } from "@tanstack/react-router";
import {
  QrCode,
  Scan,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  Layers,
  Clock,
  Building2,
  Check,
  Zap,
  Star,
  Lock,
  Flame,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Attendrix — Smart attendance tracking platform" },
      {
        name: "description",
        content:
          "Attendrix is a modern, anti-proxy QR code student attendance tracking platform for universities and institutions.",
      },
      { property: "og:title", content: "Attendrix — Smart attendance tracking platform" },
      {
        property: "og:description",
        content:
          "Real-time QR-based student attendance, batch management, and live presence analytics.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Attendrix
              </span>
              <span className="text-[10px] font-mono text-muted-foreground -mt-1 font-semibold">
                Smart Attendance Control
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-muted-foreground md:flex">
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a href="#benefits" className="hover:text-primary transition-colors">
              Why Attendrix
            </a>
            <a href="#roles" className="hover:text-primary transition-colors">
              Roles & Roster
            </a>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Support
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 bg-hero-gradient">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <Badge
              variant="outline"
              className="gap-2 px-3 py-1 text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20 rounded-full shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              Attendrix — Smart attendance tracking platform
            </Badge>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground leading-[1.15]">
              Eliminate Attendance Proxies with{" "}
              <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Dynamic QR Control
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Attendrix empowers colleges, universities, and training institutes with single-use
              rotating QR codes, live student presence rosters, USN tracking, and dynamic batch
              analytics.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link to="/app/dashboard">
                <Button
                  size="lg"
                  className="gap-2 font-bold shadow-lg shadow-primary/25 text-sm bg-gradient-to-r from-primary to-emerald-600 hover:opacity-90"
                >
                  <Scan className="h-4 w-4" /> Open Attendrix Portal{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold text-sm border-border/80 hover:bg-muted"
                >
                  Student / Admin Portal
                </Button>
              </Link>
            </div>

            {/* TRUST BADGES */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground font-mono font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dynamic 120s Token Rotation
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> MySQL DB & Spring Boot
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-emerald-500" /> 3s Realtime Live Sync
              </span>
            </div>
          </div>

          {/* INTERACTIVE DEMO CARD SHOWCASE */}
          <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  attendrix.app/live-session
                </span>
              </div>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> LIVE SESSION
                ACTIVE
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Live QR Code Demo */}
              <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
                  <QrCode className="h-28 w-28 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold font-mono text-primary">SUB-DSA-A12</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Expires in 00:42s (Auto-Rotates)
                  </p>
                </div>
              </div>

              {/* Right Column: Live Batch Stats & Roster Preview */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border/50 bg-background/80 text-center">
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      Total Registered
                    </p>
                    <p className="text-lg font-bold font-mono text-foreground mt-0.5">5 Students</p>
                  </div>
                  <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-center">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Total Present
                    </p>
                    <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      4 Present
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-primary/30 bg-primary/10 text-center">
                    <p className="text-[10px] text-primary font-semibold">Attendance Rate</p>
                    <p className="text-lg font-bold font-mono text-primary mt-0.5">80.00%</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/50 bg-background/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <UserCheck className="h-4 w-4 text-emerald-500" /> Recent Student Check-ins
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      3s Auto-Sync
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      {
                        name: "Student 1",
                        email: "student1@gmail.com",
                        usn: "STU001",
                        status: "PRESENT ✓",
                      },
                      {
                        name: "Student 2",
                        email: "student2@gmail.com",
                        usn: "STU002",
                        status: "PRESENT ✓",
                      },
                    ].map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40 font-mono"
                      >
                        <span className="font-bold text-foreground">{s.name}</span>
                        <span className="text-muted-foreground hidden sm:inline">{s.usn}</span>
                        <Badge className="bg-emerald-600 text-white text-[9px] font-bold">
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <Badge
              variant="outline"
              className="font-mono text-xs text-primary border-primary/20 bg-primary/5"
            >
              POWERFUL CAPABILITIES
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Everything Needed for Smart Attendance Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Attendrix combines anti-proxy security, real-time sync, and batch analytics into a
              single seamless platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: QrCode,
                title: "Anti-Proxy Dynamic QR",
                body: "Generates time-bound, single-use encrypted tokens that rotate every 60 seconds to stop proxying.",
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: Layers,
                title: "Active Batch Cohorts",
                body: "Configure batch codes, subject schedules, trainer details, and start times effortlessly.",
                color: "text-primary bg-primary/10",
              },
              {
                icon: Users,
                title: "Live Student Rosters",
                body: "Track registered students by Name, Email, and USN with instant real-time presence indicators.",
                color: "text-teal-500 bg-teal-500/10",
              },
              {
                icon: BarChart3,
                title: "Automated Analytics",
                body: "Calculates batch attendance percentages, present/absent counts, and history reports dynamically.",
                color: "text-indigo-500 bg-indigo-500/10",
              },
            ].map((f) => (
              <Card
                key={f.title}
                className="border border-border/60 hover:border-primary/40 transition-all shadow-xs hover:shadow-md bg-card"
              >
                <CardContent className="p-6 space-y-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${f.color}`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES BREAKDOWN SECTION */}
      <section id="roles" className="py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <Badge
              variant="outline"
              className="font-mono text-xs text-primary border-primary/20 bg-primary/5"
            >
              TAILORED WORKFLOWS
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Built for Students & Administrators
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border border-border/70 p-6 bg-card/60 backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">For Students</h3>
                  <p className="text-xs text-muted-foreground">
                    Seamless, instant attendance verification
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Scan dynamic QR codes directly using device camera or enter dynamic tokens.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    View overall attendance % and subject-wise breakdown across enrolled batches.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Access complete attendance history logs with timestamps and status indicators.
                  </span>
                </li>
              </ul>
            </Card>

            <Card className="border border-border/70 p-6 bg-card/60 backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">For Administrators</h3>
                  <p className="text-xs text-muted-foreground">
                    Full system & batch cohort control
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Create custom batch codes, assign trainer names, branches, and schedules.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Inspect live student presence rosters with student USNs, Emails, and Names.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time background sync guarantees accurate attendance reports.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-border/50 bg-background/80 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 font-mono">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span>
              © {new Date().getFullYear()} <strong>Attendrix</strong> — Smart attendance tracking
              platform. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/app/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
