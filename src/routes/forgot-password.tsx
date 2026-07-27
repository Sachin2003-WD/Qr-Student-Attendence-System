import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Mentor Matrix" },
      { name: "description", content: "Reset your Mentor Matrix account password." },
      { property: "og:title", content: "Forgot password — Mentor Matrix" },
      { property: "og:description", content: "Reset your account password." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="We'll send you a reset link."
      footer={<Link to="/login" className="text-primary hover:underline">Back to sign in</Link>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => { e.preventDefault(); toast.success("Reset link sent (demo)"); }}
      >
        <div className="grid gap-2"><Label htmlFor="e">Email</Label><Input id="e" type="email" required /></div>
        <Button className="w-full">Send reset link</Button>
      </form>
    </AuthShell>
  );
}
