import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mentor Matrix" },
      { name: "description", content: "Learn about Mentor Matrix, an AI-powered mentoring platform for higher education." },
      { property: "og:title", content: "About Mentor Matrix" },
      { property: "og:description", content: "AI-powered mentoring platform for higher education." },
    ],
  }),
  component: About,
});

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <span className="font-bold">Mentor Matrix</span>
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">{children}</main>
    </div>
  );
}

function About() {
  return (
    <Shell>
      <h1 className="text-4xl font-bold tracking-tight">About Mentor Matrix</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Mentor Matrix is a modern web platform built for colleges and universities to
        streamline the mentoring relationship between students, faculty mentors, and administrators.
      </p>
      <div className="mt-10 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold">Our mission</h2>
          <p className="mt-2 text-muted-foreground">Give every student a mentor who matches their goals, and give every institution the visibility to make mentoring measurably better.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold">What we do</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Match students to mentors by department, skills, interests, and capacity.</li>
            <li>Schedule sessions with conflict detection and calendar views.</li>
            <li>Collect structured feedback and surface it in analytics.</li>
            <li>Provide role-based dashboards for students, mentors, and admins.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Technology</h2>
          <p className="mt-2 text-muted-foreground">React 18, Vite, Tailwind CSS, and Recharts on the frontend. Java 21, Spring Boot, Spring Security, JPA/Hibernate, and MySQL on the backend, secured with JWT.</p>
        </section>
      </div>
    </Shell>
  );
}
