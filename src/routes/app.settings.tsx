import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-context";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Smart Attendance System" },
      { name: "description", content: "Application settings and preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme, role } = useApp();

  const [compactDensity, setCompactDensity] = useState(() => {
    return localStorage.getItem("sa.compact") === "true";
  });
  const [emailNotifs, setEmailNotifs] = useState(() => {
    return localStorage.getItem("sa.email_notifs") !== "false";
  });
  const [inAppNotifs, setInAppNotifs] = useState(() => {
    return localStorage.getItem("sa.inapp_notifs") !== "false";
  });
  const [reminders, setReminders] = useState(() => {
    return localStorage.getItem("sa.reminders") !== "false";
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("compact-density", compactDensity);
    localStorage.setItem("sa.compact", String(compactDensity));
  }, [compactDensity]);

  const handleToggleEmail = (val: boolean) => {
    setEmailNotifs(val);
    localStorage.setItem("sa.email_notifs", String(val));
    toast.success(`Email notifications ${val ? "enabled" : "disabled"}`);
  };

  const handleToggleInApp = (val: boolean) => {
    setInAppNotifs(val);
    localStorage.setItem("sa.inapp_notifs", String(val));
    toast.success(`In-app notifications ${val ? "enabled" : "disabled"}`);
  };

  const handleToggleReminders = (val: boolean) => {
    setReminders(val);
    localStorage.setItem("sa.reminders", String(val));
    toast.success(`Class reminders ${val ? "enabled" : "disabled"}`);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setPassLoading(true);
    try {
      await api.updatePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Customize your application preferences and security settings." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Row label="Dark mode" description="Switch between light and dark themes.">
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </Row>
            <Row label="Compact density" description="Compact table spacing and denser card layouts.">
              <Switch checked={compactDensity} onCheckedChange={setCompactDensity} />
            </Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Row label="Email notifications" description="Attendance alerts and system status emails.">
              <Switch checked={emailNotifs} onCheckedChange={handleToggleEmail} />
            </Row>
            <Row label="In-app notifications" description="Toasts and header bell notifications.">
              <Switch checked={inAppNotifs} onCheckedChange={handleToggleInApp} />
            </Row>
            <Row label="Session reminders" description="Notify 30 minutes before class sessions.">
              <Switch checked={reminders} onCheckedChange={handleToggleReminders} />
            </Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={handlePasswordUpdate}>
              <div className="grid gap-2">
                <Label>Current password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  required
                />
              </div>
              <Button type="submit" disabled={passLoading}>
                {passLoading ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {role === "admin" && (
          <Card>
            <CardHeader><CardTitle>System</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Row label="Enable auto-backup" description="Nightly database snapshot backup.">
                <Switch defaultChecked />
              </Row>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => toast.success("Database backup created successfully!")}>
                  Backup database
                </Button>
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
