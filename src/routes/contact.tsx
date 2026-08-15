import { createFileRoute, Link } from "@tanstack/react-router";
import {
  QrCode,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Support & Helpdesk — Attendrix | Smart attendance tracking platform" },
      {
        name: "description",
        content:
          "Get support, request demos, or report technical issues with the Attendrix platform team.",
      },
      { property: "og:title", content: "Support & Helpdesk — Attendrix" },
      {
        property: "og:description",
        content: "Get in touch with the Attendrix platform team for technical support.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(
        "Support request submitted successfully! Our team will respond within 24 hours.",
      );
    }, 600);
  };

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
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-primary font-bold">
              Support
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* SUPPORT CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 flex-1 grid gap-10 lg:grid-cols-2 items-start">
        <div className="space-y-6">
          <Badge
            variant="outline"
            className="gap-2 px-3 py-1 text-xs font-mono font-bold bg-primary/10 text-primary border-primary/20 rounded-full"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> ATTENDRIX SUPPORT
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-tight">
            How can we help your institution?
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Have questions about setting up dynamic QR attendance, configuring batch codes, or
            connecting your MySQL database? Our dedicated support team is here to assist.
          </p>

          <div className="space-y-4 pt-4">
            <Card className="border border-border/60 bg-card p-4 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Email Support</p>
                <p className="text-sm font-bold font-mono text-foreground">cksachin94@gmail.com</p>
              </div>
            </Card>

            <Card className="border border-border/60 bg-card p-4 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                <p className="text-sm font-bold font-mono text-foreground">+91 79 7577 8491</p>
              </div>
            </Card>

            <Card className="border border-border/60 bg-card p-4 flex items-center gap-4 shadow-xs">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Location</p>
                <p className="text-sm font-bold text-foreground">Bengaluru, Karnataka, India</p>
              </div>
            </Card>
          </div>
        </div>

        {/* SUPPORT TICKET FORM */}
        <Card className="border border-border/70 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Submit Your Request
            </h2>
            <p className="text-xs text-muted-foreground">
              Fill out the form below and we will respond within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Your Name</Label>
              <Input required placeholder="Enter Your Name" className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email Address</Label>
              <Input
                type="email"
                required
                placeholder="Enter Your Email"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Subject / Category</Label>
              <Input required placeholder="Enter Your Query" className="h-9 text-xs" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Message Description</Label>
              <Textarea
                required
                rows={4}
                placeholder="Provide details about your query or issue..."
                className="text-xs resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full font-bold text-xs h-10 shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700"
            >
              {sending ? "Submitting Support Ticket..." : "Submit Support Request"}
            </Button>
          </form>
        </Card>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-background/80 py-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 font-mono">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            <span>
              © {new Date().getFullYear()} <strong>Attendrix</strong> — Smart attendance tracking
              platform.
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
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
