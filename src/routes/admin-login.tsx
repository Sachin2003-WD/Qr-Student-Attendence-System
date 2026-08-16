import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { ShieldCheck, KeyRound, Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Smart Attendance System" },
      { name: "description", content: "Dedicated administrator control panel login." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
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
      toast.error("Please enter a valid administrator email address (e.g. admin@college.edu).");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Please enter your admin password (minimum 6 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginAdmin(cleanEmail, password);
      setRole("admin");
      toast.success(`Welcome back, ${res.name || res.email}! Administrator control active.`);
      nav({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Invalid administrator email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Banner - Indigo Admin Theme */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Admin Control Portal</span>
        </Link>

        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Institution Administrator Access
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            System Control & Batch Analytics
          </h2>
          <p className="text-indigo-100/90 text-sm leading-relaxed">
            Manage attendance batches, view system-wide logs, generate calendar reports, and
            configure classroom session engines.
          </p>
        </div>

        <div className="text-xs text-indigo-200/70">
          © {new Date().getFullYear()} Smart Attendance Management System • Administrator Control
        </div>
      </div>

      {/* Right Form - Dedicated Admin Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ADMIN CONTROL
            </span>
          </div>

          <Card className="border-indigo-500/20 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Administrator Sign In</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Enter your administrative credentials to access system controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="a-email" className="text-xs font-semibold">
                    Administrator Email Address
                  </Label>
                  <Input
                    id="a-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="a-pass" className="text-xs font-semibold">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      search={{ role: "admin" }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id="a-pass"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    className="h-10 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 mt-2"
                  disabled={loading}
                >
                  <KeyRound className="h-4 w-4" />
                  {loading ? "Authenticating Admin…" : "Sign In to Admin Control Panel"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground space-y-2">
            <div>
              Authorized administrator account creation:{" "}
              <Link
                to="/admin-register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Register Admin Account
              </Link>
            </div>
            {/* <div className="pt-2 border-t text-[11px]">
              Are you a Student?{" "}
              <Link
                to="/student-login"
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Go to Student Login Page
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
