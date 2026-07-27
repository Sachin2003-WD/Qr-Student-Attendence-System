import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Mentor Matrix" },
      { name: "description", content: "Get in touch with the Mentor Matrix team for demos, partnerships, and support." },
      { property: "og:title", content: "Contact Mentor Matrix" },
      { property: "og:description", content: "Get in touch for demos, partnerships, and support." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sending, setSending] = useState(false);
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
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Talk to us</h1>
          <p className="mt-3 text-muted-foreground">We usually reply within one business day.</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> hello@mentormatrix.io</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +91 80 4567 8900</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Bengaluru, India</li>
          </ul>
        </div>
        <form
          className="glass-card space-y-4 rounded-2xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSending(true);
            setTimeout(() => { setSending(false); toast.success("Message sent — we'll be in touch."); }, 700);
          }}
        >
          <div className="grid gap-2"><Label htmlFor="n">Name</Label><Input id="n" required /></div>
          <div className="grid gap-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="m">Message</Label><Textarea id="m" rows={5} required /></div>
          <Button className="w-full" disabled={sending}>{sending ? "Sending…" : "Send message"}</Button>
        </form>
      </main>
    </div>
  );
}
