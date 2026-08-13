import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { ShieldCheck, UserPlus } from "lucide-react";

export const Route = createFileRoute("/register/admin")({
  head: () => ({
    meta: [
      { title: "Admin Registration — Smart Attendance System" },
      { name: "description", content: "Create an Administrator Attendance account." },
    ],
  }),
  component: AdminRegister,
});

function AdminRegister() {
  const nav = useNavigate();
  const { setRole } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
    <AuthShell
      title="Create Administrator Account"
      subtitle="Setup your institution administrator credentials & control panel."
      footer={
        <div className="space-y-2">
          <div>
            Already have an administrator account?{" "}
            <Link to="/login/admin" className="font-semibold text-primary hover:underline">
              Sign In as Administrator
            </Link>
          </div>
          <div className="pt-2 text-xs border-t">
            Registering as Student?{" "}
            <Link to="/register/student" className="font-semibold text-primary hover:underline">
              Switch to Student Registration
            </Link>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border border-chart-2/30 bg-chart-2/5 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-chart-2" />
          <span>Administrator Registration Portal</span>
        </div>
        <span className="rounded-md bg-chart-2/15 px-2 py-0.5 font-mono text-[10px] font-bold text-chart-2">
          ADMIN
        </span>
      </div>

      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-xs font-semibold">
            Administrator Full Name
          </Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Enter Your Name"
            className="h-10 text-xs"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-xs font-semibold">
              Official Email Address
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="admin@college.edu"
              className="h-10 text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-xs font-semibold">
              Mobile Phone
            </Label>
            <Input
              id="phone"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="9876543210"
              className="h-10 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="pass" className="text-xs font-semibold">
              Password
            </Label>
            <Input
              id="pass"
              type="password"
              required
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="e.g. Password@123"
              className="h-10 text-xs"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cpass" className="text-xs font-semibold">
              Confirm Password
            </Label>
            <Input
              id="cpass"
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
          className="w-full text-xs font-semibold h-10 gap-2 mt-2"
          disabled={loading}
        >
          <UserPlus className="h-4 w-4" />
          {loading ? "Creating Admin Account…" : "Register Administrator Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
