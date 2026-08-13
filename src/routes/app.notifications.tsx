import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  CheckCheck,
  Send,
  User,
  Users,
  ShieldAlert,
  Clock,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Messaging — Attendrix" },
      {
        name: "description",
        content: "Official system notifications, alerts, and administrator broadcasts.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  sender: string;
  recipient: string; // "ALL_STUDENTS" or student email/name
  recipientName?: string;
  priority: "normal" | "important" | "high";
  time: string;
  date: string;
  read: boolean;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Welcome to Attendrix Smart Attendance Platform",
    body: "Your student profile is active. Please present your personal dynamic QR code during classroom sessions for automated attendance logging.",
    sender: "System Administrator",
    recipient: "ALL_STUDENTS",
    recipientName: "All Students",
    priority: "normal",
    time: "09:00 AM",
    date: new Date().toISOString().split("T")[0],
    read: false,
  },
  {
    id: "notif-2",
    title: "Attendance Roster Sync Completed",
    body: "Daily batch attendance session records for Grooming & Skills and Java Full Stack have been successfully updated in MySQL database.",
    sender: "Laxman Ashok Handenavar (Faculty Lead)",
    recipient: "ALL_STUDENTS",
    recipientName: "All Students",
    priority: "important",
    time: "10:30 AM",
    date: new Date().toISOString().split("T")[0],
    read: true,
  },
];

function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem("sa.notifications");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_NOTIFICATIONS;
}

function saveStoredNotifications(notifs: AppNotification[]): void {
  localStorage.setItem("sa.notifications", JSON.stringify(notifs));
  window.dispatchEvent(new Event("storage"));
}

function NotificationsPage() {
  const { role, userName, userEmail } = useApp();
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Admin Broadcast / Messaging Form State
  const [recipientType, setRecipientType] = useState<"ALL" | "INDIVIDUAL">("ALL");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>("");
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "high">("normal");
  const [sending, setSending] = useState(false);

  const loadNotifications = () => {
    setNotificationsList(getStoredNotifications());
  };

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      if (data && data.length > 0) {
        setStudents(data);
        setSelectedStudentEmail(data[0].email);
      }
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    loadStudents();

    const handleStorage = () => loadNotifications();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleMarkAllRead = () => {
    const updated = notificationsList.map((n) => ({ ...n, read: true }));
    setNotificationsList(updated);
    saveStoredNotifications(updated);
    toast.success("Marked all notifications as read");
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !bodyInput.trim()) {
      toast.error("Please enter both notification title and message body.");
      return;
    }

    try {
      setSending(true);

      let targetRecipient = "ALL_STUDENTS";
      let targetRecipientName = "All Students";

      if (recipientType === "INDIVIDUAL" && selectedStudentEmail) {
        const found = students.find((s) => s.email === selectedStudentEmail);
        targetRecipient = selectedStudentEmail;
        targetRecipientName = found?.name || selectedStudentEmail;
      }

      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: titleInput.trim(),
        body: bodyInput.trim(),
        sender: userName ? `${userName} (Administrator)` : "System Administrator",
        recipient: targetRecipient,
        recipientName: targetRecipientName,
        priority,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toISOString().split("T")[0],
        read: false,
      };

      const updated = [newNotif, ...notificationsList];
      setNotificationsList(updated);
      saveStoredNotifications(updated);

      toast.success(`Message sent successfully to ${targetRecipientName}!`);
      setTitleInput("");
      setBodyInput("");
    } catch (err: any) {
      toast.error("Failed to dispatch notification.");
    } finally {
      setSending(false);
    }
  };

  // Filter notifications based on role
  const currentUserEmail = userEmail || localStorage.getItem("sa.email") || "";
  const currentUserName = userName || localStorage.getItem("sa.name") || "";

  const visibleNotifications = notificationsList.filter((n) => {
    if (role === "admin") return true; // Admin sees all sent & system notifications
    // Student sees broadcast notifications OR messages sent specifically to them
    return (
      n.recipient === "ALL_STUDENTS" ||
      n.recipient === currentUserEmail ||
      (currentUserEmail && n.recipient.toLowerCase() === currentUserEmail.toLowerCase()) ||
      (currentUserName &&
        n.recipientName &&
        n.recipientName.toLowerCase() === currentUserName.toLowerCase())
    );
  });

  return (
    <>
      <PageHeader
        title="Official Notifications & Announcements"
        subtitle={
          role === "admin"
            ? "Admin Control Portal: Broadcast announcements to all students or message individual students."
            : "Official announcements, batch updates, and session notifications from Administrator."
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-1.5 text-xs font-semibold"
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" /> Mark All as Read
          </Button>
        }
      />

      <div className="space-y-6">
        {/* ADMIN EXCLUSIVE: SEND MESSAGE FORM */}
        {role === "admin" && (
          <Card className="border border-primary/30 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3 border-b border-primary/10">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Send className="h-5 w-5" /> Send Announcement / Message to Students
              </CardTitle>
              <CardDescription className="text-xs">
                Administrators can send messages to all students or a specific student.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Recipient Scope Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Recipient Scope
                    </label>
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value as "ALL" | "INDIVIDUAL")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="ALL">📢 All Enrolled Students (Broadcast)</option>
                      <option value="INDIVIDUAL">👤 Individual Specific Student</option>
                    </select>
                  </div>

                  {/* Individual Student Selector */}
                  {recipientType === "INDIVIDUAL" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Select Student
                      </label>
                      <select
                        value={selectedStudentEmail}
                        onChange={(e) => setSelectedStudentEmail(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {students.length > 0 ? (
                          students.map((s) => (
                            <option key={s.id || s.email} value={s.email}>
                              {s.name || s.email} ({s.usn || s.email})
                            </option>
                          ))
                        ) : (
                          <option value="">No registered students found</option>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Priority Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as "normal" | "important" | "high")
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="normal">Normal Announcement</option>
                      <option value="important">⭐ Important Alert</option>
                      <option value="high">🚨 High Priority / Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Notification Title
                  </label>
                  <Input
                    placeholder="Enter announcement subject"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="h-9 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Message Content
                  </label>
                  <Textarea
                    placeholder="Type official notification message to be dispatched to students..."
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    className="min-h-[90px] text-xs font-normal resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto text-xs font-bold gap-2 h-9 px-6 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />{" "}
                  {sending ? "Dispatching..." : "Dispatch Notification Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* STUDENT VIEW NOTICE */}
        {role === "student" && (
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="flex items-center gap-3 p-3.5 text-xs text-muted-foreground">
              <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
              <span>
                Notifications view is <strong>Read-Only for Students</strong>. Official
                announcements are broadcasted directly by Administrators and Faculty Leads.
              </span>
            </CardContent>
          </Card>
        )}

        {/* NOTIFICATIONS LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-primary" /> Received Notifications (
              {visibleNotifications.length})
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Auto-Synced
            </Badge>
          </h3>

          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((n) => (
              <Card
                key={n.id}
                className={cn(
                  "transition-all border-border/60 shadow-xs",
                  !n.read && "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20",
                )}
              >
                <CardContent className="flex items-start gap-3.5 p-4">
                  <div
                    className={cn(
                      "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold text-xs",
                      !n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {n.recipient === "ALL_STUDENTS" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{n.title}</span>
                        {n.priority === "high" && (
                          <Badge className="bg-rose-600 text-white font-bold text-[9px]">
                            Urgent
                          </Badge>
                        )}
                        {n.priority === "important" && (
                          <Badge className="bg-amber-600 text-white font-bold text-[9px]">
                            Important
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{n.time}</span>
                        <span>• {n.date}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Sender: {n.sender}</span>
                      <Badge variant="outline" className="font-mono text-[10px] bg-background">
                        Recipient: {n.recipientName || n.recipient}
                      </Badge>
                    </div>
                  </div>

                  {!n.read && (
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border border-border/60">
              <CardContent className="py-12 text-center text-xs text-muted-foreground space-y-2">
                <Bell className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="font-bold">No Notifications Received Yet</p>
                <p className="text-[11px]">
                  Official system alerts and administrator announcements will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
