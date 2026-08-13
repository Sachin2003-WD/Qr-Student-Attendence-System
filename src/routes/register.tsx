import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Card } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Registration Portal — Smart Attendance System" },
      {
        name: "description",
        content: "Choose Student Registration or Authorized Administrator Registration.",
      },
    ],
  }),
  component: RegisterHub,
});

function RegisterHub() {
  return (
    <AuthShell
      title="Select Registration Portal"
      subtitle="Registration forms for Students and Authorized Administrators."
      footer={
        <div>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Go to Sign In Selection
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Student Registration Card */}
        <Link to="/student-register" className="block">
          <Card className="p-5 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer group text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">Student Registration</h3>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      STUDENT
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    For enrolled students with official USN & academic details
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Card>
        </Link>

        {/* Admin Registration Card */}
        <Link to="/admin-register" className="block">
          <Card className="p-5 border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer group text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">
                      Administrator Registration
                    </h3>
                    <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      RESTRICTED ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Requires Admin Security Code to prevent unauthorized access
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          </Card>
        </Link>
      </div>
    </AuthShell>
  );
}
