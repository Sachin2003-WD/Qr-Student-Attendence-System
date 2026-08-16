import { createFileRoute, Link } from "@tanstack/react-router";
import {
  QrCode,
  Scan,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Users,
  BarChart3,
  FlaskConical,
  Camera,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Attendrix — Smart Attendance & Lab Management Platform" },
      {
        name: "description",
        content:
          "Attendrix is a simple, anti-proxy QR code student attendance tracking and practical lab management platform for universities and institutions.",
      },
    ],
  }),
  component: SimpleLandingPage,
});

function SimpleLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-primary to-emerald-500 text-primary-foreground shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Attendrix
              </span>
              <span className="text-[10px] font-mono text-muted-foreground -mt-1 font-semibold">
                Smart Attendance
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="sm"
                className="text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-16 sm:pt-20 sm:pb-24 border-b border-border/40 bg-hero-gradient">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <Badge
            variant="outline"
            className="gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20 rounded-full"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            Anti-Proxy Smart Attendance & Lab Hub
          </Badge>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-tight text-balance">
            Next-Generation Smart Attendance with{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Dynamic QR Codes
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Eliminate attendance proxying with rotating encrypted QR codes, fast optical camera
            scanning, practical laboratory tracking, and instant automated reports.
          </p>

          {/* Direct Role Portals */}
          <div className="pt-3 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/student-login">
              <Button
                size="lg"
                className="h-11 px-6 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 cursor-pointer shadow-md shadow-primary/20"
              >
                <GraduationCap className="h-4 w-4" /> Student Portal
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/admin-login">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 text-xs font-bold gap-2 border-border/80 hover:bg-muted cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE CAPABILITIES */}
      <section className="py-16 bg-muted/20 border-b border-border/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Simple, Reliable Attendance Management
            </h2>
            <p className="text-xs text-muted-foreground">
              Everything needed to run daily classroom and laboratory attendance effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: QrCode,
                title: "Anti-Proxy Dynamic QR",
                desc: "Time-bound, encrypted rotating QR codes that stop proxy check-ins.",
                color: "text-primary bg-primary/10",
              },
              {
                icon: Camera,
                title: "Fast Camera Scanner",
                desc: "High-speed camera decoding with audio confirmation for fast entry.",
                color: "text-emerald-500 bg-emerald-500/10",
              },
              {
                icon: FlaskConical,
                title: "Practical Labs Hub",
                desc: "Track practical sessions, PC terminals, experiment titles, and grades.",
                color: "text-purple-500 bg-purple-500/10",
              },
              {
                icon: BarChart3,
                title: "Automated Reports",
                desc: "Live batch attendance percentages with 1-click PDF and Excel export.",
                color: "text-blue-500 bg-blue-500/10",
              },
            ].map((f) => (
              <Card key={f.title} className="border border-border/60 shadow-xs bg-card">
                <CardContent className="p-5 space-y-2.5">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${f.color}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ROLES BREAKDOWN */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Card */}
            <Card className="border border-border/70 p-6 bg-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">For Students</h3>
                    <p className="text-xs text-muted-foreground">
                      Easy attendance and subject progress tracking
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Display personal dynamic QR code on your mobile or tablet.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>View subject-wise attendance percentages and exam eligibility.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Track practical experiment sign-offs and awarded marks.</span>
                  </li>
                </ul>
              </div>
              <Link to="/student-login">
                <Button className="w-full text-xs font-bold gap-2 cursor-pointer bg-primary hover:bg-primary/90">
                  Student Sign In <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>

            {/* Admin / Faculty Card */}
            <Card className="border border-border/70 p-6 bg-card flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      For Administrators & Faculty
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Batch control, camera scanning, and compliance reports
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Scan student QR codes instantly with positive audio feedback.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Create batches, manage timetables, and evaluate practical labs.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Download official attendance logs in PDF, Excel, or CSV.</span>
                  </li>
                </ul>
              </div>
              <Link to="/admin-login">
                <Button className="w-full text-xs font-bold gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white">
                  Admin Sign In <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mt-auto border-t border-border/50 bg-background/80 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 font-mono">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} Attendrix — Smart Attendance Platform</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/login" className="hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-primary transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
