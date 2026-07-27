import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mentor Matrix" },
      { name: "description", content: "Application settings and preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme, role } = useApp();
  return (
    <>
      <PageHeader title="Settings" subtitle="Customize your Mentor Matrix experience." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Row label="Dark mode" description="Switch between light and dark themes.">
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </Row>
            <Row label="Compact density" description="Denser tables and cards.">
              <Switch />
            </Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Row label="Email notifications" description="Session approvals and reminders."><Switch defaultChecked /></Row>
            <Row label="In-app notifications" description="Toasts and bell alerts."><Switch defaultChecked /></Row>
            <Row label="Session reminders" description="Notify 30 minutes before a session."><Switch defaultChecked /></Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Password updated"); }}>
              <div className="grid gap-2"><Label>Current password</Label><Input type="password" /></div>
              <div className="grid gap-2"><Label>New password</Label><Input type="password" /></div>
              <Button type="submit">Update password</Button>
            </form>
          </CardContent>
        </Card>
        {role === "admin" && (
          <Card>
            <CardHeader><CardTitle>System</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row label="Enable auto-backup" description="Nightly database snapshot."><Switch defaultChecked /></Row>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast.success("Backup started")}>Backup database</Button>
                <Button variant="outline" onClick={() => toast("Restore modal (demo)")}>Restore database</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
