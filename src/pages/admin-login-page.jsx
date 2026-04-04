import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AdminAccessBadge } from "../components/admin-route";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useToast } from "../components/toast-provider";
import { useAdminAuth } from "../components/admin-auth-provider";
import { Seo } from "../lib/seo";

export function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAdminAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/admin";

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      await login(username, password);
      showToast({
        title: "Admin signed in",
        description: "You now have access to the admin workspace.",
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      showToast({
        title: "Sign in failed",
        description: error.message || "Check your admin username and password.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Seo title="Admin Login | Xerox Wala" description="Secure admin sign in for order management and pricing controls." />

      <section className="py-14 sm:py-18">
        <div className="section-shell">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="admin-hero p-8 text-slate-900 shadow-[0_30px_70px_rgba(148,75,37,0.16)]">
              <AdminAccessBadge />
              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Secure admin workspace login</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-700">
                Sign in to manage the order queue, update delivery stages, publish daily homepage updates, and control service pricing.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="admin-soft-panel rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Protected actions</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">Orders, status changes, homepage updates, and catalog pricing are only available after login.</p>
                </div>
                <div className="admin-soft-panel rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Session-based access</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">Your admin session stays active in the browser until you sign out or the session expires.</p>
                </div>
              </div>
            </Card>

            <Card className="admin-panel p-8 text-slate-900 shadow-[0_24px_60px_rgba(148,75,37,0.14)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/70 via-orange-200/80 to-rose-200/80 text-orange-700 shadow-[0_12px_28px_rgba(249,115,22,0.16)]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Admin login</p>
                  <p className="mt-1 text-sm text-slate-600">Use your internal credentials to continue.</p>
                </div>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Username</label>
                  <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter admin username" autoComplete="username" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting || !username.trim() || !password.trim()}>
                  {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? "Signing in..." : "Sign in to admin"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
