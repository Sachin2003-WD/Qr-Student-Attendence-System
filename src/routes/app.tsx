import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Workspace — Smart Attendance System" },
      { name: "description", content: "Your Smart Attendance workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  const nav = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = api.getToken();
    if (token) {
      setHasToken(true);
    } else {
      setHasToken(false);
      nav({ to: "/login" });
    }
  }, [nav]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-primary animate-pulse">Loading Workspace…</div>
        </div>
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="space-y-2">
          <div className="text-base font-semibold">Authentication required</div>
          <div className="text-xs text-muted-foreground">Redirecting to sign in...</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
