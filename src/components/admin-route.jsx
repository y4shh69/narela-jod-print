import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { Card } from "./ui/card";
import { useAdminAuth } from "./admin-auth-provider";

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-shell">
          <Card className="mx-auto max-w-md border-white/16 bg-slate-950/76 p-8 text-center text-white">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand-300" />
            <p className="mt-4 text-sm font-medium text-white/74">Checking admin session…</p>
          </Card>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function AdminGuestRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-shell">
          <Card className="mx-auto max-w-md border-white/16 bg-slate-950/76 p-8 text-center text-white">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand-300" />
            <p className="mt-4 text-sm font-medium text-white/74">Preparing admin access…</p>
          </Card>
        </div>
      </section>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export function AdminAccessBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
      <LockKeyhole className="h-3.5 w-3.5" />
      Admin access
    </div>
  );
}
