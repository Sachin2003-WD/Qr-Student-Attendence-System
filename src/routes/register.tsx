import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments } from "@/lib/mock-data";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { ShieldCheck, UserCheck, Building2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Smart Attendance System" },
      { name: "description", content: "Create your Smart Attendance System account as a student, faculty, or administrator." },
      { property: "og:title", content: "Create your Smart Attendance System account" },
      { property: "og:description", content: "Join the Smart Attendance System." },
    ],
  }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [role, setRole] = useState<"student" | "mentor" | "admin">("student");

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState(departments[0]);

  // Student specific
  const [usn, setUsn] = useState("");
  const [semester, setSemester] = useState("5");
  const [section, setSection] = useState("A");
  const [gender, setGender] = useState("MALE");
  const [dob, setDob] = useState("2003-05-15");
  const [address, setAddress] = useState("College Campus, Block B");

  // Mentor/Faculty specific
  const [employeeId, setEmployeeId] = useState("");
  const [designation, setDesignation] = useState("Assistant Professor");
  const [experience, setExperience] = useState("5");
  const [qualification, setQualification] = useState("Ph.D. in CS");
  const [specialization, setSpecialization] = useState("Artificial Intelligence & Machine Learning");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic format checks before API call
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error("Invalid phone number! Must be a 10-digit number starting with 6-9.");
      return;
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passRegex.test(password)) {
      toast.error("Password must be at least 8 characters containing uppercase, lowercase, digit, and special character (@$!%*?&#).");
      return;
    }

    setLoading(true);

    try {
      let payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword: password,
      };

      if (role === "student") {
        payload = {
          ...payload,
          usn: usn.trim() || `1MS21CS${Math.floor(100 + Math.random() * 900)}`,
          department,
          semester: parseInt(semester, 10),
          section,
          gender,
          dob,
          address,
        };
      } else if (role === "mentor") {
        payload = {
          ...payload,
          employeeId: employeeId.trim() || `EMP${Math.floor(100 + Math.random() * 900)}`,
          department,
          designation,
          experience: parseInt(experience, 10),
          qualification,
          specialization,
        };
      }

      await api.register(payload, role);
      toast.success("Account created successfully! Please sign in.");
      nav({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Your Account"
      subtitle="Register as Student, Faculty, or Administrator."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4 text-left" onSubmit={handleSubmit}>
        {/* ROLE SELECTION — STACKED TO PREVENT OVERLAPPING */}
        <div className="grid gap-2">
          <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-primary" /> Select Role
          </Label>
          <Select value={role} onValueChange={(val: any) => setRole(val)}>
            <SelectTrigger className="w-full h-10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student Account</SelectItem>
              <SelectItem value="mentor">Faculty / Mentor Account</SelectItem>
              <SelectItem value="admin">Administrator Account (Up to 10 Admins)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DEPARTMENT SELECTION — STACKED TO PREVENT OVERLAPPING */}
        <div className="grid gap-2">
          <Label className="font-semibold text-xs text-foreground flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-primary" /> Department
          </Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full h-10 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="n" className="text-xs font-semibold">Full Name</Label>
          <Input id="n" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sachin C K" className="h-9 text-xs" />
        </div>

        {role === "student" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold">USN / Student ID</Label>
              <Input required value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="1MS21CS001" className="h-9 text-xs" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold">Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {role === "mentor" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs font-semibold">Employee ID</Label>
              <Input required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP901" className="h-9 text-xs" />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-semibold">Specialization</Label>
              <Input required value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="e" className="text-xs font-semibold">Email Address</Label>
            <Input id="e" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@college.edu" className="h-9 text-xs" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ph" className="text-xs font-semibold">Phone (10 Digits)</Label>
            <Input id="ph" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="h-9 text-xs" />
            <span className="text-[10px] text-muted-foreground">Starts with 6-9</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="p" className="text-xs font-semibold">Password</Label>
          <Input id="p" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password@123" className="h-9 text-xs" />
          <span className="text-[10px] text-muted-foreground">Min 8 chars: 1 uppercase, 1 lowercase, 1 number, 1 special (@$!%*?&#)</span>
        </div>

        <Button type="submit" className="w-full gap-2 text-xs font-semibold h-10 mt-2" disabled={loading}>
          <ShieldCheck className="h-4 w-4" />
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
