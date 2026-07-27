import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Mentor Matrix" },
      { name: "description", content: "Set a new password for your Mentor Matrix account." },
      { property: "og:title", content: "Reset password — Mentor Matrix" },
      { property: "og:description", content: "Set a new password for your account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const nav = useNavigate();
  return (
    <AuthShell
      title="Set a new password"
      footer={<Link to="/login" className="text-primary hover:underline">Back to sign in</Link>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => { e.preventDefault(); toast.success("Password updated"); nav({ to: "/login" }); }}
      >
        <div className="grid gap-2"><Label htmlFor="p">New password</Label><Input id="p" type="password" minLength={8} required /></div>
        <div className="grid gap-2"><Label htmlFor="c">Confirm password</Label><Input id="c" type="password" minLength={8} required /></div>
        <Button className="w-full">Update password</Button>
      </form>
    </AuthShell>
  );
}
