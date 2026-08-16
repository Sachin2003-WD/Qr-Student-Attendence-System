import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Mail, GraduationCap, ShieldCheck, KeyRound } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Smart Attendance System" },
      { name: "description", content: "Request OTP / password reset code for your account." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const [role, setRole] = useState<"student" | "admin">(
    search?.role === "admin" ? "admin" : "student",
  );
  const [email, setEmail] = useState(search?.email || "");
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
      toast.success(
        res.message || "A 6-digit verification code has been sent to your email.",
        { duration: 5000 },
      );

      setTimeout(() => {
        nav({
          to: "/reset-password",
          search: { email: cleanEmail, role } as any,
        });
      }, 700);
    } catch (err: any) {
      toast.error(
        err.message || "Failed to send OTP to email. Please check if email is registered.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: "student" | "admin") => {
    setRole(newRole);
  };

  return (
    <AuthShell
      title={`Forgot ${role === "admin" ? "Admin" : "Student"} Password?`}
      subtitle="Enter your registered email to receive your 6-digit password reset OTP code."
      footer={
        <div className="space-y-2 text-center text-xs">
          <div>
            Remembered your credentials?{" "}
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
        {/* Role Switcher Tabs */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Account Role</Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => handleRoleChange("student")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === "student"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("admin")}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === "admin"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-4 w-4" /> Admin / Faculty
            </button>
          </div>
        </div>

        {/* Email Input */}
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
            placeholder="Enter your registered email address"
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
            ? "Sending OTP Code…"
            : `Send 6-Digit OTP to ${role === "admin" ? "Admin" : "Student"}`}
        </Button>
      </form>
    </AuthShell>
  );
}
