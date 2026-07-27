import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { feedback, mentorName, studentName, sessions } from "@/lib/mock-data";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — Mentor Matrix" },
      { name: "description", content: "Give and view mentoring session feedback." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const completed = sessions.filter((s) => s.status === "completed");
  return (
    <>
      <PageHeader title="Feedback" subtitle="Rate and comment on your completed sessions." />
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader><CardTitle>Recent feedback</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {feedback.map((f) => (
              <div key={f.id} className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{studentName(f.from).split(" ").map(x => x[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{studentName(f.from)} → {mentorName(f.to)}</div>
                    <div className="text-xs text-muted-foreground">{f.date}</div>
                  </div>
                  <div className="flex text-chart-4">
                    {[1,2,3,4,5].map((i) => <Star key={i} className={cn("h-3.5 w-3.5", i <= f.rating && "fill-current")} />)}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">"{f.comment}"</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle>Leave feedback</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); toast.success("Feedback submitted"); }}
            >
              <div className="grid gap-2">
                <Label>Session</Label>
                <select className="h-10 rounded-md border bg-background px-3 text-sm">
                  {completed.map((s) => <option key={s.id}>{s.topic} — {mentorName(s.mentor)}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                      <Star className={cn("h-7 w-7 transition", i <= rating ? "fill-chart-4 text-chart-4" : "text-muted-foreground/40")} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2"><Label htmlFor="c">Comment</Label><Textarea id="c" rows={4} placeholder="Share what was helpful…" /></div>
              <Button type="submit" className="w-full">Submit feedback</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
