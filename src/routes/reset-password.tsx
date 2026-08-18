import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  KeyRound,
  ShieldCheck,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  GraduationCap,
  RotateCw,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: typeof search.email === "string" ? search.email : "",
    role: typeof search.role === "string" ? search.role : "student",
    otp: typeof search.otp === "string" ? search.otp : "",
  }),
  head: () => ({
    meta: [
      { title: "Reset Password — Smart Attendance System" },
      { name: "description", content: "Set a new password using your OTP code." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const [email, setEmail] = useState(search?.email || "");
  const [role, setRole] = useState<"student" | "admin">(
    search?.role === "admin" ? "admin" : "student",
  );
  const [otp, setOtp] = useState(search?.otp || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  // Sync with search params if they arrive late
  useEffect(() => {
    if (search?.email && !email) setEmail(search.email);
    if (search?.role && (search.role === "admin" || search.role === "student")) setRole(search.role);
  }, [search]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_+=-]/.test(newPassword);
  const passwordsMatch = newPassword && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial;

  const handleResendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email first to resend OTP.");
      return;
    }
    setResending(true);
    try {
      const res = await api.forgotPassword(email.trim().toLowerCase(), role);
      toast.success(res.message || "A new 6-digit OTP code has been sent to your email.", {
        description: "Please check your inbox (and spam folder) for the 6-digit verification code.",
        duration: 6000,
      });
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your registered email.");
      return;
    }
    if (!otp.trim()) {
      toast.error("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    if (!isPasswordValid) {
      toast.error(
        "Password must be at least 8 characters, with uppercase, lowercase, number, and special character.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        },
        role,
      );
      toast.success(
        res.message || "Password reset successfully! You can now sign in with your new password.",
      );
      setTimeout(() => {
        nav({ to: role === "admin" ? "/admin-login" : "/student-login" });
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please check your OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={`Reset ${role === "admin" ? "Admin" : "Student"} Password`}
      subtitle="Enter the 6-digit OTP received in your email and choose a new secure password."
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
        {/* Role Toggle Selector */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Account Role</Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setRole("student")}
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
              onClick={() => setRole("admin")}
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

        {/* Email Address */}
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
            placeholder="Enter your registered email"
            className="h-10 text-xs"
          />
        </div>

        {/* 6-Digit OTP Input & Resend */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="otp" className="text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Enter OTP Code
            </Label>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending || countdown > 0}
              className={`text-xs font-medium flex items-center gap-1 cursor-pointer ${countdown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary hover:underline"}`}
            >
              <RotateCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>
          <Input
            id="otp"
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6 Digit OTP"
            className="h-10 text-sm font-mono tracking-widest text-center font-bold"
          />
        </div>

        {/* New Password Input with Show/Hide toggle */}
        <div className="grid gap-2">
          <Label htmlFor="np" className="text-xs font-semibold">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="np"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className="h-10 text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input with Show/Hide toggle */}
        <div className="grid gap-2">
          <Label htmlFor="cp" className="text-xs font-semibold">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              id="cp"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="h-10 text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-[11px] space-y-1.5">
          <div className="font-semibold text-muted-foreground text-xs">Password Requirements:</div>
          <div className="grid grid-cols-2 gap-1 text-muted-foreground">
            <div
              className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 font-semibold" : ""}`}
            >
              {hasMinLength ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 opacity-40" />
              )}
              At least 8 characters
            </div>
            <div
              className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-600 font-semibold" : ""}`}
            >
              {hasUpper ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 opacity-40" />
              )}
              Uppercase letter (A-Z)
            </div>
            <div
              className={`flex items-center gap-1.5 ${hasLower ? "text-emerald-600 font-semibold" : ""}`}
            >
              {hasLower ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 opacity-40" />
              )}
              Lowercase letter (a-z)
            </div>
            <div
              className={`flex items-center gap-1.5 ${hasDigit ? "text-emerald-600 font-semibold" : ""}`}
            >
              {hasDigit ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 opacity-40" />
              )}
              Number (0-9)
            </div>
            <div
              className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-600 font-semibold" : ""}`}
            >
              {hasSpecial ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 opacity-40" />
              )}
              Special symbol (@$!%*?)
            </div>
            <div
              className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-600 font-semibold" : ""}`}
            >
              {passwordsMatch ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <XCircle className="h-3.5 w-3.5 opacity-40" />
              )}
              Passwords match
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full text-xs font-semibold h-10 gap-2 mt-2"
          disabled={loading}
        >
          <KeyRound className="h-4 w-4" />
          {loading ? "Resetting Password…" : "Update Password & Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
