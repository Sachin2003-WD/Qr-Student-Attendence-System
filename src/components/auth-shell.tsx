import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-chart-2 p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><Sparkles className="h-5 w-5" /></div>
          <span className="text-lg font-bold">Mentor Matrix</span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Mentoring, measured.</h2>
          <p className="mt-3 text-white/80">Match students with the right mentor, schedule sessions, and turn feedback into outcomes.</p>
        </div>
        <div className="text-xs text-white/60">© {new Date().getFullYear()} Mentor Matrix</div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <span className="font-bold">Mentor Matrix</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function useDemoAuth() {
  const nav = useNavigate();
  return { goToApp: () => nav({ to: "/app/dashboard" }) };
}
