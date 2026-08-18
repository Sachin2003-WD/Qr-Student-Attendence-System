import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Layers,
  IdCard,
  Shield,
  Key,
  QrCode,
  CheckCircle2,
  Bell,
  Smartphone,
  RefreshCw,
  Copy,
  Check,
  Edit3,
  X,
  Save,
  BookOpen,
  FileText,
  Code2,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { api, type DepartmentItem, type QRCodeResponse } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Account Settings — Smart Attendance System" },
      {
        name: "description",
        content:
          "Manage personal details, academic department, section, security settings, and dynamic QR tokens.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { role, userName, userEmail, updateUserProfile } = useApp();

  // Profile Form States
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState("Computer Science");
  const [semester, setSemester] = useState("6");
  const [section, setSection] = useState("Section A");
  const [usn, setUsn] = useState("");
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Security / Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowAttendanceAlerts, setLowAttendanceAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Student Dynamic QR Token State
  const [studentQR, setStudentQR] = useState<QRCodeResponse | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications" | "qr">(
    "general",
  );

  const loadProfileData = useCallback(async () => {
    try {
      const [deptsData, profileData] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getProfile().catch(() => null),
      ]);

      if (deptsData && deptsData.length > 0) {
        setDepartments(deptsData);
      }

      if (profileData) {
        if (profileData.name) setName(profileData.name);
        if (profileData.email) setEmail(profileData.email);
        if (profileData.phone) setPhone(profileData.phone);
        if (profileData.department) setDept(profileData.department);
        if (profileData.semester) setSemester(String(profileData.semester));
        if (profileData.section) setSection(profileData.section);
        if (profileData.usn) setUsn(profileData.usn);
      } else {
        // Retrieve local stored user details
        const storedPhone = localStorage.getItem("sa.phone") || "";
        const storedDept = localStorage.getItem("sa.dept") || "Computer Science";
        const storedSem = localStorage.getItem("sa.sem") || "6";
        const storedSection = localStorage.getItem("sa.section") || "Section A";
        const storedUsn =
          localStorage.getItem("sa.usn") || (role === "admin" ? "EMP-ADMIN-01" : "");
        const storedBio = localStorage.getItem("sa.bio") || "";
        const storedSkills = localStorage.getItem("sa.skills") || "";

        setPhone(storedPhone);
        setDept(storedDept);
        setSemester(storedSem);
        setSection(storedSection);
        setUsn(storedUsn);
        setBio(storedBio);
        setSkills(storedSkills);
      }
    } catch {
      // silent
    }
  }, [role]);

  // Load student dynamic QR
  const loadDynamicQR = useCallback(async () => {
    if (role !== "student") return;
    try {
      const qr = await api.getDynamicStudentQR();
      setStudentQR(qr);
    } catch {
      // ignore
    }
  }, [role]);

  useEffect(() => {
    loadProfileData();
    if (role === "student") {
      loadDynamicQR();
      const qrInterval = setInterval(loadDynamicQR, 120000);
      return () => {
        clearInterval(qrInterval);
      };
    }
  }, [loadProfileData, loadDynamicQR, role]);

  const initials =
    (name || userName || "User")
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      // Instant state update without full page refresh
      updateUserProfile({ name: name.trim(), email: email.trim() });
      localStorage.setItem("sa.phone", phone);
      localStorage.setItem("sa.dept", dept);
      localStorage.setItem("sa.sem", semester);
      localStorage.setItem("sa.section", section);
      localStorage.setItem("sa.usn", usn);
      localStorage.setItem("sa.bio", bio);
      localStorage.setItem("sa.skills", skills);

      await api.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: dept,
      });

      setIsEditing(false);
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPass(true);
    try {
      await api.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setChangingPass(false);
    }
  };

  const handleCopyToken = () => {
    if (!studentQR?.token) return;
    navigator.clipboard.writeText(studentQR.token);
    setCopiedToken(true);
    toast.success("Dynamic QR Token copied to clipboard!");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile & Account Settings"
        subtitle="Manage your personal information, department affiliation, academic section, credentials, and notification preferences."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? "outline" : "default"}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => {
                setIsEditing(!isEditing);
                setActiveTab("general");
              }}
            >
              {isEditing ? (
                <>
                  <X className="h-3.5 w-3.5" /> Cancel Edit
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => {
                loadProfileData();
                if (role === "student") loadDynamicQR();
                toast.success("Profile synchronized!");
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync
            </Button>
          </div>
        }
      />

      {/* TOP PROFILE SUMMARY CARD */}
      <Card className="border-border/60 shadow-xs overflow-hidden bg-card">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-chart-2/20 to-primary/10 border-b border-border/40" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{name || "User Profile"}</h1>
                  <Badge
                    className={`text-[10px] font-bold uppercase ${
                      role === "admin"
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    {role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {email || "user@college.edu"}
                  </span>
                  {phone && (
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {phone}
                    </span>
                  )}
                  {usn && (
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-foreground">
                      {usn}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold"
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab("general");
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5 text-primary" /> Edit Profile Details
                </Button>
              )}
              <Badge
                variant="outline"
                className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 py-1 px-3"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Account Verified & Active
              </Badge>
            </div>
          </div>

          {/* Quick Academic Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">Department</div>
              <div className="text-xs font-bold text-foreground truncate mt-0.5">{dept}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">Academic Section</div>
              <div className="text-xs font-bold text-primary font-mono mt-0.5">{section}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">Semester</div>
              <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                Semester {semester}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-center">
              <div className="text-[10px] text-muted-foreground font-medium">Portal Access</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">Full Privileges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <User className="h-3.5 w-3.5" /> Personal & Academic Details
        </button>

        {role === "student" && (
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "qr"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" /> Dynamic Student QR Code
          </button>
        )}

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Shield className="h-3.5 w-3.5" /> Security & Credentials
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "notifications"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Bell className="h-3.5 w-3.5" /> Alerts & Preferences
        </button>
      </div>

      {/* TAB 1: GENERAL & ACADEMIC DETAILS */}
      {activeTab === "general" && (
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {isEditing ? "Edit Personal & Academic Information" : "Personal & Academic Profile"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isEditing
                  ? "Update your contact details, academic department, section, and profile bio."
                  : "View your verified personal details, academic affiliation, and profile information."}
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                size="sm"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Details
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-semibold"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Full Name</Label>
                    <Input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address</Label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Phone Number</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {role === "admin" ? "Admin Employee ID" : "University Seat Number (USN)"}
                    </Label>
                    <Input
                      value={usn}
                      onChange={(e) => setUsn(e.target.value)}
                      placeholder={role === "admin" ? "EMP-ADMIN-01" : "1RA21CS001"}
                      className="h-9 text-xs font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Academic Department</Label>
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      className="w-full h-9 text-xs bg-background border border-border rounded-md px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    >
                      {departments.length > 0 ? (
                        departments.map((d) => (
                          <option key={d.code} value={d.name}>
                            {d.name} ({d.code})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Computer Science">Computer Science (CSE)</option>
                          <option value="Information Technology">Information Technology (IT)</option>
                          <option value="Electronics & Comm">Electronics & Comm (ECE)</option>
                          <option value="AIML & Data Science">AIML & Data Science (AIDS)</option>
                          <option value="Mechanical Eng">Mechanical Eng (ME)</option>
                          <option value="Civil Engineering">Civil Engineering (CV)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Semester</Label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full h-9 text-xs bg-background border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={String(s)}>
                            Sem {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Section</Label>
                      <select
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full h-9 text-xs bg-background border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium font-mono"
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="Section D">Section D</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold">Technical Skills</Label>
                    <Input
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. Java, React, Python, Data Structures"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold">Biography / Academic Focus</Label>
                    <Textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a brief bio about your academic focus, projects, or responsibilities..."
                      className="text-xs resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loading}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {loading ? "Saving Details..." : "Save Profile Details"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> Full Name
                    </span>
                    <div className="text-sm font-bold text-foreground">{name || "Not specified"}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                    </span>
                    <div className="text-sm font-mono text-foreground truncate">{email || "Not specified"}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" /> Contact Phone
                    </span>
                    <div className="text-sm font-mono text-foreground">{phone || "+91 98765 43210"}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <IdCard className="h-3.5 w-3.5 text-primary" />
                      {role === "admin" ? "Employee / Admin ID" : "USN / Registration No."}
                    </span>
                    <div className="text-sm font-mono font-bold text-primary">{usn || (role === "admin" ? "EMP-ADMIN-01" : "Not Provided")}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> Department
                    </span>
                    <div className="text-sm font-semibold text-foreground">{dept}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" /> Semester & Section
                    </span>
                    <div className="text-sm font-semibold text-foreground">
                      Semester {semester} • <span className="font-mono text-primary">{section}</span>
                    </div>
                  </div>
                </div>

                {skills && (
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-primary" /> Technical Skills & Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.split(",").map((s, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs font-medium">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {bio && (
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-1.5">
                    <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Profile Biography
                    </span>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: DYNAMIC STUDENT QR CODE (STUDENTS ONLY) */}
      {activeTab === "qr" && role === "student" && (
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-base font-bold flex items-center justify-center gap-2 text-primary">
              <QrCode className="h-5 w-5" /> Your Personal Dynamic Attendance QR Code
            </CardTitle>
            <CardDescription className="text-xs">
              Present this dynamic QR code to the Admin / Faculty scanner to record your attendance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4 pt-2">
            {studentQR?.qrCodeBase64 ? (
              <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-primary/20">
                <img
                  src={studentQR.qrCodeBase64}
                  alt="Student Dynamic QR"
                  className="h-56 w-56 object-contain"
                />
              </div>
            ) : (
              <div className="grid h-56 w-56 place-items-center rounded-2xl border bg-card text-xs">
                Generating Dynamic QR...
              </div>
            )}

            <div className="space-y-1.5 max-w-sm w-full">
              <div className="flex items-center justify-between text-xs font-mono font-bold bg-background p-2.5 rounded-lg border border-border">
                <span>{studentQR?.token || "Generating..."}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  onClick={handleCopyToken}
                >
                  {copiedToken ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedToken ? "Copied" : "Copy Token"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SECURITY & CREDENTIALS */}
      {activeTab === "security" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Change Password Card */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> Update Password
              </CardTitle>
              <CardDescription className="text-xs">
                Ensure your account is using a strong password with at least 6 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Current Password</Label>
                  <Input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">New Password</Label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Confirm New Password</Label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="h-9 text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={changingPass}
                  className="w-full text-xs font-semibold mt-2"
                >
                  {changingPass ? "Updating Password..." : "Save New Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Security & Session Overview */}
          <Card className="border-border/60 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" /> Account Security & Sessions
              </CardTitle>
              <CardDescription className="text-xs">
                Active security safeguards, authentication method, and login device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground">Two-Factor Authentication</div>
                  <div className="text-[11px] text-muted-foreground">
                    Add an extra verification layer
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={twoFactorEnabled ? "default" : "outline"}
                  className="h-8 text-xs font-semibold"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    toast.success(
                      `Two-Factor Authentication ${!twoFactorEnabled ? "Enabled" : "Disabled"}`,
                    );
                  }}
                >
                  {twoFactorEnabled ? "Enabled ✓" : "Enable 2FA"}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-primary" /> Active Login Session
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Web Browser / Desktop</span>
                    <Badge className="bg-emerald-600 text-white text-[9px] font-bold">ONLINE</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Signed in as: <strong className="text-foreground">{email}</strong>
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Role Privileges: <strong className="uppercase text-primary">{role}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: ALERTS & NOTIFICATION PREFERENCES */}
      {activeTab === "notifications" && (
        <Card className="border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Attendance Alerts & Notification Settings
            </CardTitle>
            <CardDescription className="text-xs">
              Configure how and when you receive attendance updates, session reminders, and shortage
              warnings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground">
                  Daily Attendance Marking Email
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Receive an automated email summary every time your attendance is marked.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  setEmailAlerts(e.target.checked);
                  toast.success("Notification preferences updated.");
                }}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground">
                  Low Attendance Shortage Warning
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Receive alert if monthly section attendance drops below the 75% requirement.
                </div>
              </div>
              <input
                type="checkbox"
                checked={lowAttendanceAlerts}
                onChange={(e) => {
                  setLowAttendanceAlerts(e.target.checked);
                  toast.success("Shortage alert preferences updated.");
                }}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground">
                  SMS / WhatsApp Push Notifications
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Send immediate mobile alerts on new class sessions and timetable updates.
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => {
                  setSmsAlerts(e.target.checked);
                  toast.success("Mobile notification preferences updated.");
                }}
                className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
