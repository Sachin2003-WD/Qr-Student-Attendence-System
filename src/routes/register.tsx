import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { departments } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Mentor Matrix" },
      { name: "description", content: "Create your Mentor Matrix account as a student, mentor, or admin." },
      { property: "og:title", content: "Create your Mentor Matrix account" },
      { property: "og:description", content: "Join Mentor Matrix and get matched with the right mentor." },
    ],
  }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell
      title="Create your account"
      subtitle="Takes less than a minute."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => { toast.success("Account created — please sign in."); nav({ to: "/login" }); }, 600);
        }}
      >
        <div className="grid gap-2"><Label htmlFor="n">Full name</Label><Input id="n" required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2"><Label>Role</Label>
            <Select defaultValue="student">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Department</Label>
            <Select defaultValue={departments[0]}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required /></div>
        <div className="grid gap-2"><Label htmlFor="ph">Phone</Label><Input id="ph" type="tel" /></div>
        <div className="grid gap-2"><Label htmlFor="p">Password</Label><Input id="p" type="password" minLength={8} required /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}
