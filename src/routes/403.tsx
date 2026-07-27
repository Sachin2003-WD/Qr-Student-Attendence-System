import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/403")({
  head: () => ({
    meta: [
      { title: "Access denied — Mentor Matrix" },
      { name: "description", content: "You don't have permission to view this page." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Access denied" },
      { property: "og:description", content: "You don't have permission to view this page." },
    ],
  }),
  component: Forbidden,
});

function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient px-4">
      <div className="glass-card max-w-md rounded-2xl p-10 text-center">
        <div className="text-7xl font-bold text-primary">403</div>
        <h1 className="mt-2 text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have permission to view this page.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/app/dashboard"><Button>Go to dashboard</Button></Link>
          <Link to="/"><Button variant="outline">Home</Button></Link>
        </div>
      </div>
    </div>
  );
}
