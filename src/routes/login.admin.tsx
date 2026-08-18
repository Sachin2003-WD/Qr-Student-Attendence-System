import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { ShieldCheck, KeyRound } from "lucide-react";

export const Route = createFileRoute("/login/admin")({
  head: () => ({
    meta: [
      { title: "Admin Login — Smart Attendance System" },
      { name: "description", content: "Sign in to your Administrator Attendance account." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const { setRole } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanInput = email.trim();
    if (!cleanInput || cleanInput.length < 3) {
      toast.error("Please enter your administrator email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your admin password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginAdmin(cleanInput, password);
      const userRole = res.role?.toLowerCase() === "student" ? "student" : "admin";
      setRole(userRole);
      toast.success(`Welcome back, ${res.name || cleanInput}! Login successful.`);
      nav({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials! Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Administrator Control Panel Login"
      subtitle="Access batch setup, institution analytics, calendar reports & scanner system."
      footer={
        <div className="space-y-2">
          <div>
            Need an Administrator account?{" "}
            <Link to="/register/admin" className="font-semibold text-primary hover:underline">
              Register Administrator Account
            </Link>
          </div>
          <div className="pt-2 text-xs border-t">
            Are you a Student?{" "}
            <Link to="/login/student" className="font-semibold text-primary hover:underline">
              Switch to Student Login
            </Link>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border border-chart-2/30 bg-chart-2/5 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-chart-2" />
          <span>Administrator Access Privileges</span>
        </div>
        <span className="rounded-md bg-chart-2/15 px-2 py-0.5 font-mono text-[10px] font-bold text-chart-2">ADMIN</span>
      </div>

      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-xs font-semibold">Administrator Email Address</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@college.edu"
            className="h-10 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pass" className="text-xs font-semibold">Password</Label>
            <Link to="/forgot-password" search={{ role: "admin" } as any} className="text-xs text-muted-foreground hover:text-primary font-medium">
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
            placeholder="Enter admin password"
            className="h-10 text-xs"
          />
        </div>

        <Button type="submit" className="w-full text-xs font-semibold h-10 gap-2 mt-2" disabled={loading}>
          <KeyRound className="h-4 w-4" />
          {loading ? "Authenticating Admin…" : "Sign in to Admin Dashboard"}
        </Button>
      </form>
    </AuthShell>
  );
}
