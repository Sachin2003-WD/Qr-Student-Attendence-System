import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { useApp, type Role } from "@/lib/app-context";
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
  const { setRole } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRoleState] = useState<Role>("student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await api.login(cleanEmail, password, role);
      setRole(role);
      toast.success(`Welcome back, ${res.name || res.email}!`);
      nav({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password. If you haven't registered, create an account first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your role-specific dashboard."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label>Select Your Account Role</Label>
          <Select value={role} onValueChange={(val: any) => setRoleState(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="mentor">Faculty / Mentor</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="e">Email Address</Label>
          <Input
            id="e"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. name@college.edu"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="p">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Forgot?
            </Link>
          </div>
          <Input
            id="p"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your account password"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Authenticating…" : `Sign in as ${role === "student" ? "Student" : role === "mentor" ? "Faculty" : "Admin"}`}
        </Button>
      </form>
    </AuthShell>
  );
}
