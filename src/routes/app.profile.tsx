import { createFileRoute } from "@tanstack/react-router";
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
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Mentor Matrix" },
      { name: "description", content: "Manage your Mentor Matrix profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { role, userName } = useApp();
  const initials = userName.split(" ").map((s) => s[0]).slice(0, 2).join("");
  return (
    <>
      <PageHeader title="Profile" subtitle="Update your personal information and preferences." />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-24 w-24"><AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-2xl font-bold text-primary-foreground">{initials}</AvatarFallback></Avatar>
            <h2 className="mt-4 text-lg font-semibold">{userName}</h2>
            <Badge variant="secondary" className="mt-1 capitalize">{role}</Badge>
            <Button variant="outline" size="sm" className="mt-4 w-full gap-1"><Upload className="h-4 w-4" /> Upload photo</Button>
            {role === "student" && (
              <Button variant="outline" size="sm" className="mt-2 w-full gap-1"><FileText className="h-4 w-4" /> Upload resume</Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }}>
              <div className="grid gap-2"><Label>Full name</Label><Input defaultValue={userName} /></div>
              <div className="grid gap-2"><Label>Email</Label><Input type="email" defaultValue="rohan@college.edu" /></div>
              <div className="grid gap-2"><Label>Phone</Label><Input type="tel" defaultValue="+91 98765 43210" /></div>
              <div className="grid gap-2">
                <Label>Department</Label>
                <Select defaultValue={departments[0]}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {role === "student" && (
                <>
                  <div className="grid gap-2"><Label>Semester</Label><Input type="number" min={1} max={8} defaultValue={5} /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Skills</Label><Input defaultValue="Python, ML, React" /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Interests</Label><Input defaultValue="AI, Startups" /></div>
                </>
              )}
              {role === "mentor" && (
                <>
                  <div className="grid gap-2 sm:col-span-2"><Label>Expertise</Label><Input defaultValue="AI/ML, Data Structures, Python" /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Bio</Label><Textarea rows={3} defaultValue="Professor with 12+ years of experience in AI and ML." /></div>
                </>
              )}
              <div className="sm:col-span-2 flex justify-end gap-2"><Button variant="outline" type="button">Cancel</Button><Button type="submit">Save changes</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
