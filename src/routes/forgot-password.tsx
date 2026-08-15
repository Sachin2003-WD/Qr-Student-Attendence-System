import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Mail, UserCheck, KeyRound, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Smart Attendance System" },
      { name: "description", content: "Request OTP / password reset link for your account." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"student" | "admin">(
    search?.role === "admin" ? "admin" : "student",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail, role);
      toast.success(res.message || `OTP sent successfully to ${cleanEmail}`);
      // Navigate to reset password page with email and role
      nav({ to: "/reset-password", search: { email: cleanEmail, role } as any });
    } catch (err: any) {
      toast.error(
        err.message || "Failed to send OTP to email. Please check if email is registered.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={`Forgot ${role === "admin" ? "Admin" : "Student"} Password?`}
      subtitle="Enter your registered email to receive a password reset 6-digit OTP code."
      footer={
        <div className="space-y-2">
          <div>
            Remembered your password?{" "}
            <Link
              to={role === "admin" ? "/admin-login" : "/student-login"}
              className="font-semibold text-primary hover:underline"
            >
              Back to {role === "admin" ? "Admin" : "Student"} Sign In
            </Link>
          </div>
        </div>
      }
    >
      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label className="text-xs font-semibold flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-primary" /> Select Account Role
          </Label>
          <Select value={role} onValueChange={(val: any) => setRole(val)}>
            <SelectTrigger className="h-10 text-xs w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student Account</SelectItem>
              <SelectItem value="admin">Administrator Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Registered Email Address
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === "admin" ? "e.g. admin@college.edu" : "e.g. student@college.edu"}
            className="h-10 text-xs"
          />
        </div>

        <Button
          type="submit"
          className="w-full text-xs font-semibold h-10 gap-2 mt-2"
          disabled={loading}
        >
          <KeyRound className="h-4 w-4" />
          {loading
            ? "Sending Reset OTP…"
            : `Send OTP to ${role === "admin" ? "Admin" : "Student"} Email`}
        </Button>
      </form>
    </AuthShell>
  );
}
