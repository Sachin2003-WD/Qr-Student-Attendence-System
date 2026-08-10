import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Smart Attendance System" },
      { name: "description", content: "Set a new password using your OTP." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const [email, setEmail] = useState(search?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin">(search?.role || "student");
  const [loading, setLoading] = useState(false);

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

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passRegex.test(newPassword)) {
      toast.error("Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character (e.g. Password@123).");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      }, role);
      toast.success("Password reset successfully! You can now sign in with your new password.");
      nav({ to: role === "admin" ? "/login" : "/login" });
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. Please check your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Account Password"
      subtitle="Enter the OTP received on your email and set a new password."
      footer={
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to Sign In
        </Link>
      }
    >
      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-xs font-semibold flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
          </Label>
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
          <Label htmlFor="otp" className="text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 6-Digit OTP Code
          </Label>
          <Input
            id="otp"
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP (e.g. 123456)"
            className="h-10 text-xs font-mono tracking-widest text-center"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="np" className="text-xs font-semibold">New Password</Label>
          <Input
            id="np"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="e.g. Password@123"
            className="h-10 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cp" className="text-xs font-semibold">Confirm New Password</Label>
          <Input
            id="cp"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="h-10 text-xs"
          />
        </div>

        <Button type="submit" className="w-full text-xs font-semibold h-10 gap-2 mt-2" disabled={loading}>
          <KeyRound className="h-4 w-4" />
          {loading ? "Resetting Password…" : "Update Password"}
        </Button>
      </form>
    </AuthShell>
  );
}
