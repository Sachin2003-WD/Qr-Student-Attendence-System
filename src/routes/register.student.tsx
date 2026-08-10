import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { GraduationCap, UserPlus, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/register/student")({
  head: () => ({
    meta: [
      { title: "Student Registration — Smart Attendance System" },
      { name: "description", content: "Create your Student Attendance account." },
    ],
  }),
  component: StudentRegister,
});

function StudentRegister() {
  const nav = useNavigate();
  const { setRole } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    usn: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    department: "Computer Science",
    semester: 1,
    section: "A",
    gender: "MALE",
    dob: "2003-05-15",
    address: "Campus Residence, College Road",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!formData.usn.trim()) {
      toast.error("Please enter your USN / Student ID.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
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
        "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 digit, and 1 special character (e.g. Password@123)."
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
        usn: formData.usn.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        department: formData.department,
        semester: Number(formData.semester),
        section: formData.section.toUpperCase(),
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
      };

      const res = await api.registerStudent(payload);
      setRole("student");
      toast.success(`Registration successful! Welcome ${res.name || formData.name}!`);
      nav({ to: "/app/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to register student. Please check input details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Student Account"
      subtitle="Register to track attendance, scan QR codes & view subject reports."
      footer={
        <div className="space-y-2">
          <div>
            Already have a student account?{" "}
            <Link to="/login/student" className="font-semibold text-primary hover:underline">
              Sign In as Student
            </Link>
          </div>
          <div className="pt-2 text-xs border-t">
            Registering as Administrator?{" "}
            <Link to="/register/admin" className="font-semibold text-primary hover:underline">
              Switch to Admin Registration
            </Link>
          </div>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Student Account Portal</span>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">STUDENT</span>
      </div>

      <form className="space-y-3 text-left" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
              className="h-9 text-xs"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="usn" className="text-xs font-semibold">USN / Roll No.</Label>
            <Input
              id="usn"
              required
              value={formData.usn}
              onChange={(e) => updateField("usn", e.target.value)}
              placeholder="e.g. 1MS21CS001"
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="student@college.edu"
              className="h-9 text-xs"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold">Mobile Phone (10 digits)</Label>
            <Input
              id="phone"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="9876543210"
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Department</Label>
            <Select value={formData.department} onValueChange={(val) => updateField("department", val)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Information Technology">Information Tech</SelectItem>
                <SelectItem value="Electronics & Comm">Electronics & Comm</SelectItem>
                <SelectItem value="Mechanical Eng">Mechanical Eng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Semester</Label>
            <Select value={String(formData.semester)} onValueChange={(val) => updateField("semester", Number(val))}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Section</Label>
            <Input
              required
              maxLength={2}
              value={formData.section}
              onChange={(e) => updateField("section", e.target.value)}
              placeholder="A"
              className="h-9 text-xs font-mono uppercase"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold">Gender</Label>
            <Select value={formData.gender} onValueChange={(val) => updateField("gender", val)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dob" className="text-xs font-semibold">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              required
              value={formData.dob}
              onChange={(e) => updateField("dob", e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="pass" className="text-xs font-semibold">Password</Label>
            <Input
              id="pass"
              type="password"
              required
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="e.g. Password@123"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="cpass" className="text-xs font-semibold">Confirm Password</Label>
            <Input
              id="cpass"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="Re-enter password"
              className="h-9 text-xs"
            />
          </div>
        </div>

        <Button type="submit" className="w-full text-xs font-semibold h-10 gap-2 mt-3" disabled={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? "Creating Account…" : "Register Student Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
