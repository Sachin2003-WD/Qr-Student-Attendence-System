import { createFileRoute, Link } from "@tanstack/react-router";
import { QrCode, Sparkles, ShieldCheck, Zap, Users, ArrowRight, CheckCircle2, Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Attendrix | Smart attendance tracking platform" },
      { name: "description", content: "Learn about Attendrix, a modern anti-proxy QR code student attendance tracking platform for universities and institutions." },
      { property: "og:title", content: "About Attendrix — Smart attendance tracking platform" },
      { property: "og:description", content: "Anti-proxy dynamic QR student attendance tracking platform." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 text-primary-foreground shadow-md shadow-primary/20">
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
          <nav className="flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="text-primary font-bold">About</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
            <Link to="/login"><Button variant="ghost" size="sm" className="text-xs font-semibold">Sign In</Button></Link>
          </nav>
        </div>
      </header>

      {/* ABOUT CONTENT */}
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 space-y-12 flex-1">
        <div className="text-center space-y-4">
          <Badge variant="outline" className="gap-2 px-3 py-1 text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> ABOUT ATTENDRIX
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Smart Attendance Tracking for{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Modern Institutions
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed">
            Attendrix is an enterprise-grade smart attendance tracking platform designed to eliminate attendance proxies, simplify batch roster management, and provide live real-time presence analytics for colleges, universities, and training institutes.
          </p>
        </div>

        {/* MISSION CARDS */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-border/70 bg-card p-5 space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Anti-Proxy Protection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dynamic 60-second rotating QR codes prevent students from taking static screenshots or sharing codes remotely.
            </p>
          </Card>

          <Card className="border border-border/70 bg-card p-5 space-y-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Real-Time Sync</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              3-second automated background polling updates student presence counts across active batch rosters instantly.
            </p>
          </Card>

          <Card className="border border-border/70 bg-card p-5 space-y-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 w-fit">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Batch Roster Control</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Easily configure batch codes, subject schedules, trainer details, and branch locations with detailed USN tracking.
            </p>
          </Card>
        </div>

        {/* TECH STACK SECTION */}
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 space-y-4 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Enterprise Architecture
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Attendrix is engineered with a decoupled architecture:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono">
            <div className="p-3 rounded-xl border border-border/50 bg-background/50 space-y-1">
              <span className="font-bold text-primary">Frontend Engine</span>
              <p className="text-muted-foreground">React 18, Vite, TanStack Router, Tailwind CSS, Lucide Icons, Sonner Notifications</p>
            </div>
            <div className="p-3 rounded-xl border border-border/50 bg-background/50 space-y-1">
              <span className="font-bold text-emerald-500">Backend Core</span>
              <p className="text-muted-foreground">Java 21, Spring Boot 3.3, Spring Security, JPA/Hibernate, MySQL DB, JWT Auth</p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-background/80 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 font-mono">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} <strong>Attendrix</strong> — Smart attendance tracking platform.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Support</Link>
            <Link to="/app/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
