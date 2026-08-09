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
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail || "user@college.edu");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [dept, setDept] = useState(departments[0]);
  const [loading, setLoading] = useState(false);

  const initials = name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("") || "U";

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
            <h2 className="mt-4 text-lg font-semibold">{name}</h2>
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
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. user@college.edu" />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {role === "student" && (
                <>
                  <div className="grid gap-2"><Label>Semester</Label><Input type="number" min={1} max={8} defaultValue={5} /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Skills</Label><Input defaultValue="Python, Data Structures, AI" /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Interests</Label><Input defaultValue="Machine Learning, Web Development" /></div>
                </>
              )}
              {role === "faculty" && (
                <>
                  <div className="grid gap-2 sm:col-span-2"><Label>Expertise</Label><Input defaultValue="Data Structures, Java, Algorithms" /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Bio</Label><Textarea rows={3} defaultValue="Faculty member in Computer Science Department." /></div>
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
