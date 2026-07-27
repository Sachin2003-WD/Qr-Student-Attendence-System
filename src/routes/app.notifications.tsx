import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { notifications } from "@/lib/mock-data";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Mentor Matrix" },
      { name: "description", content: "Your notifications and system alerts." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Session reminders, approvals, and system alerts."
        actions={<Button variant="outline" size="sm" onClick={() => toast.success("Marked all as read")} className="gap-1"><CheckCheck className="h-4 w-4" /> Mark all read</Button>}
      />
      <div className="space-y-2">
        {notifications.map((n) => (
          <Card key={n.id} className={cn(n.unread && "border-primary/30 bg-primary/[0.03]")}>
            <CardContent className="flex items-start gap-3 p-4">
              <div className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl", n.unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate font-medium">{n.title}</div>
                  <div className="shrink-0 text-xs text-muted-foreground">{n.time}</div>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              </div>
              {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
