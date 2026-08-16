import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { GraduationCap, KeyRound, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/login/student")({
  head: () => ({
    meta: [
      { title: "Student Login — Smart Attendance System" },
      { name: "description", content: "Sign in to your Student Attendance account." },
    ],
  }),
  component: StudentLogin,
});

function StudentLogin() {
  const nav = useNavigate();
  const { setRole } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast.error("Please enter a valid student email address (e.g. student@college.edu).");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Please enter your password (minimum 6 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginStudent(cleanEmail, password);
      setRole("student");
      toast.success(`Welcome back, ${res.name || res.email}! Student session active.`);
      nav({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password! Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Student Portal Login"
      subtitle="Access your lecture attendance, live session scanner & subject reports."
      footer={
        <div className="space-y-2">
          <div>
            Don't have a student account?{" "}
            <Link to="/register/student" className="font-semibold text-primary hover:underline">
              Register as Student
            </Link>
          </div>
          <div className="pt-2 text-xs border-t">
            Are you an Administrator?{" "}
            <Link to="/login/admin" className="font-semibold text-primary hover:underline">
              Switch to Admin Login
            </Link>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Student Account Authentication</span>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">STUDENT</span>
      </div>

      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-xs font-semibold">Student Email Address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. student@college.edu"
            className="h-10 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pass" className="text-xs font-semibold">Password</Label>
            <Link to="/forgot-password" search={{ role: "student" } as any} className="text-xs text-muted-foreground hover:text-primary font-medium">
              Forgot Password?
            </Link>
          </div>
          <Input
            id="pass"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="h-10 text-xs"
          />
        </div>

        <Button type="submit" className="w-full text-xs font-semibold h-10 gap-2 mt-2" disabled={loading}>
          <KeyRound className="h-4 w-4" />
          {loading ? "Authenticating…" : "Sign in to Student Dashboard"}
        </Button>
      </form>
    </AuthShell>
  );
}
