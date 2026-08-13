import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { GraduationCap, UserPlus, Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/student-register")({
  head: () => ({
    meta: [
      { title: "Student Registration — Smart Attendance System" },
      { name: "description", content: "Dedicated student registration form." },
    ],
  }),
  component: StudentRegisterPage,
});

function StudentRegisterPage() {
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
      toast.error("Please enter your full student name.");
      return;
    }

    if (!formData.usn.trim()) {
      toast.error("Please enter your USN / Student ID.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid student email address.");
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
      toast.error(err.message || "Failed to register student. Please check all details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Banner - Emerald Student Theme */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Smart Student Portal</span>
        </Link>

        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur border border-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Enrolled Student Registration
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">Create Your Student Profile</h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Fill in your official USN, academic department, and contact details to register your
            student attendance account.
          </p>
        </div>

        <div className="text-xs text-emerald-200/70">
          © {new Date().getFullYear()} Smart Attendance Management System • Student Portal
        </div>
      </div>

      {/* Right Form - Dedicated Student Registration */}
      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 overflow-y-auto max-h-screen">
        <div className="mx-auto w-full max-w-lg space-y-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
              STUDENT REGISTRATION
            </span>
          </div>

          <Card className="border-emerald-500/20 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold">Register Student Account</CardTitle>
              </div>
              <CardDescription className="text-xs">
                All fields are required to register your student record.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3 text-left">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="sr-name" className="text-xs font-semibold">
                      Full Name
                    </Label>
                    <Input
                      id="sr-name"
                      required
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sr-usn" className="text-xs font-semibold">
                      USN
                    </Label>
                    <Input
                      id="sr-usn"
                      required
                      value={formData.usn}
                      onChange={(e) => updateField("usn", e.target.value)}
                      placeholder="Enter your USN"
                      className="h-9 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="sr-email" className="text-xs font-semibold">
                      Email Address
                    </Label>
                    <Input
                      id="sr-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Enter your email address"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sr-phone" className="text-xs font-semibold">
                      Mobile Phone
                    </Label>
                    <Input
                      id="sr-phone"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Enter your mobile number"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(val) => updateField("department", val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Information Technology">Information Tech</SelectItem>
                        <SelectItem value="Electronics & Comm">Electronics & Comm</SelectItem>
                        <SelectItem value="Mechanical Eng">Mechanical Eng</SelectItem>
                        <SelectItem value="AIML">AI & ML</SelectItem>
                        <SelectItem value="Civil">Civil Eng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Semester</Label>
                    <Select
                      value={String(formData.semester)}
                      onValueChange={(val) => updateField("semester", Number(val))}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            Semester {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sr-sec" className="text-xs font-semibold">
                      Section
                    </Label>
                    <Input
                      id="sr-sec"
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
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => updateField("gender", val)}
                    >
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

                  <div className="space-y-1">
                    <Label htmlFor="sr-dob" className="text-xs font-semibold">
                      Date of Birth
                    </Label>
                    <Input
                      id="sr-dob"
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => updateField("dob", e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="sr-pass" className="text-xs font-semibold">
                      Password
                    </Label>
                    <Input
                      id="sr-pass"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Enter your password"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="sr-cpass" className="text-xs font-semibold">
                      Confirm Password
                    </Label>
                    <Input
                      id="sr-cpass"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      placeholder="Re-enter your password"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mt-2"
                  disabled={loading}
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? "Registering Student Account…" : "Complete Student Registration"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link
              to="/student-login"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign In to Student Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
