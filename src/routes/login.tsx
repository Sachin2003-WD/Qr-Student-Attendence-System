import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mentor Matrix" },
      { name: "description", content: "Sign in to your Mentor Matrix account." },
      { property: "og:title", content: "Sign in to Mentor Matrix" },
      { property: "og:description", content: "Access your student, mentor, or admin dashboard." },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={<>New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => { toast.success("Signed in"); nav({ to: "/app/dashboard" }); }, 500);
        }}
      >
        <div className="grid gap-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required defaultValue="rohan@college.edu" /></div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between"><Label htmlFor="p">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>
          </div>
          <Input id="p" type="password" required defaultValue="password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
    </AuthShell>
  );
}
