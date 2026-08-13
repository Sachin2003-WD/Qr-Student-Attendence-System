import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, Sparkles, ArrowLeft, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin-register")({
  head: () => ({
    meta: [
      { title: "Admin Registration — Smart Attendance System" },
      {
        name: "description",
        content: "Dedicated administrator registration form with security authorization.",
      },
    ],
  }),
  component: AdminRegisterPage,
});

function AdminRegisterPage() {
  const nav = useNavigate();
  const { setRole } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    securityKey: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your administrator full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid administrator email address.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error("Phone number must be a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    // Security Verification: Require valid Admin Security Code to prevent students from registering as Admin
    if (formData.securityKey.trim().toUpperCase() !== "ADMIN2026") {
      toast.error(
        "Invalid Admin Security Code! Only authorized institution administrators can register.",
      );
      return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passRegex.test(formData.password)) {
      toast.error(
        "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 digit, and 1 special character (e.g. Password@123).",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const res = await api.registerAdmin(payload);
      setRole("admin");
      toast.success(`Administrator registration successful! Welcome ${res.name || formData.name}!`);
      nav({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to register administrator account.");
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
          <span className="text-xl font-bold">Admin Authorization Portal</span>
        </Link>

        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Authorized Admin Onboarding
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Secure Administrator Registration
          </h2>
          <p className="text-indigo-100/90 text-sm leading-relaxed">
            Register institution coordinator accounts with strict security passcode verification to
            manage academic batches, logs & QR engines.
          </p>
        </div>

        <div className="text-xs text-indigo-200/70">
          © {new Date().getFullYear()} Smart Attendance Management System • Administrator Control
        </div>
      </div>

      {/* Right Form - Dedicated Admin Registration */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ADMIN REGISTRATION
            </span>
          </div>

          <Card className="border-indigo-500/20 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Register Admin Account</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Restricted authorization for batch coordinators & administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="ar-name" className="text-xs font-semibold">
                    Administrator Full Name
                  </Label>
                  <Input
                    id="ar-name"
                    required
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Enter Your Email"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ar-email" className="text-xs font-semibold">
                      Official Email Address
                    </Label>
                    <Input
                      id="ar-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Enter your email address"
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ar-phone" className="text-xs font-semibold">
                      Mobile Phone
                    </Label>
                    <Input
                      id="ar-phone"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter your number"
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="ar-sec"
                      className="text-xs font-semibold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Admin Security Key
                    </Label>
                    <span className="text-[10px] text-muted-foreground"></span>
                  </div>
                  <Input
                    id="ar-sec"
                    type="text"
                    required
                    value={formData.securityKey}
                    onChange={(e) => updateField("securityKey", e.target.value)}
                    placeholder="Enter security"
                    className="h-10 text-xs font-mono uppercase border-indigo-500/40 bg-indigo-500/5"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Prevents students from registering as Admin. Enter authorization key{" "}
                    <code className="font-mono text-indigo-600 font-bold"></code>.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ar-pass" className="text-xs font-semibold">
                      Password
                    </Label>
                    <Input
                      id="ar-pass"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Enter password"
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ar-cpass" className="text-xs font-semibold">
                      Confirm Password
                    </Label>
                    <Input
                      id="ar-cpass"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Re-enter password"
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 mt-2"
                  disabled={loading}
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? "Registering Admin…" : "Complete Admin Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            Already have an administrator account?{" "}
            <Link
              to="/admin-login"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign In to Admin Control
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
