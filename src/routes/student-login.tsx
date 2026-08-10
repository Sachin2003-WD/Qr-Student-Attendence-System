import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { GraduationCap, KeyRound, Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/student-login")({
  head: () => ({
    meta: [
      { title: "Student Sign In — Smart Attendance System" },
      { name: "description", content: "Dedicated sign in page for students." },
    ],
  }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
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
      toast.error(err.message || "Invalid student email or password! Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Banner - Emerald Student Theme */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Smart Student Portal</span>
        </Link>
        
        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Enrolled Student Gateway
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">Track Attendance & Scan QR Live</h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Sign in to view your subject-wise lecture attendance, scan classroom QR codes, check absent records, and view daily timetables.
          </p>
        </div>

        <div className="text-xs text-emerald-200/70">
          © {new Date().getFullYear()} Smart Attendance Management System • Student Portal
        </div>
      </div>

      {/* Right Form - Dedicated Student Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              STUDENT PORTAL
            </span>
          </div>

          <Card className="border-emerald-500/20 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Student Sign In</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Enter your student email and password to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="s-email" className="text-xs font-semibold">Student Email Address</Label>
                  <Input
                    id="s-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@college.edu"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="s-pass" className="text-xs font-semibold">Password</Label>
                    <Link to="/forgot-password" search={{ role: "student" }} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="s-pass"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your student password"
                    className="h-10 text-xs"
                  />
                </div>

                <Button type="submit" className="w-full h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mt-2" disabled={loading}>
                  <KeyRound className="h-4 w-4" />
                  {loading ? "Authenticating Student…" : "Sign In to Student Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground space-y-2">
            <div>
              Don't have a student account?{" "}
              <Link to="/student-register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Create Student Account
              </Link>
            </div>
            <div className="pt-2 border-t text-[11px]">
              Are you an Administrator?{" "}
              <Link to="/admin-login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Go to Admin Login Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
