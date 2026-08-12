import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments } from "@/lib/mock-data";
import { useApp } from "@/lib/app-context";
import { api } from "@/lib/api-client";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Smart Attendance System" },
      { name: "description", content: "Manage your account profile and preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { role, userName, userEmail, updateUserName } = useApp();
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [phone, setPhone] = useState("");
  const [dept, setDept] = useState(departments[0]);
  const [semester, setSemester] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [adminRoleDetails, setAdminRoleDetails] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = (name || "User")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "U";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (name.trim()) {
        updateUserName(name.trim());
      }
      await api.updateProfile({ name: name.trim(), email, phone, department: dept });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Update your personal information and profile details." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold">{name || "User Profile"}</h2>
            <Badge variant="secondary" className="mt-1 capitalize">{role}</Badge>
            <Button variant="outline" size="sm" className="mt-4 w-full gap-1">
              <Upload className="h-4 w-4" /> Upload photo
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
              <div className="grid gap-2">
                <Label>Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter full name" />
              </div>
              <div className="grid gap-2">
                <Label>Email address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. user@college.edu" />
              </div>
              <div className="grid gap-2">
                <Label>Phone number</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {role === "student" && (
                <>
                  <div className="grid gap-2">
                    <Label>Semester</Label>
                    <Input type="number" min={1} max={8} value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Enter semester (1-8)" />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Technical Skills</Label>
                    <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Java, Python, Data Structures, Web Development" />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Areas of Interest</Label>
                    <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Machine Learning, Cloud Computing, Full Stack Development" />
                  </div>
                </>
              )}
              {role === "admin" && (
                <>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>System Administrator Designation</Label>
                    <Input value={adminRoleDetails} onChange={(e) => setAdminRoleDetails(e.target.value)} placeholder="e.g. Chief Administrator & Attendance Coordinator" />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Department Notes & Bio</Label>
                    <Textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Enter department notes, administrative access details, or bio..." />
                  </div>
                </>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setName(userName)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
