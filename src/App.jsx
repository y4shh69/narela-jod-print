import { Navigate, Route, Routes } from "react-router-dom";
import { AdminGuestRoute, AdminProtectedRoute } from "./components/admin-route";
import { AppShell } from "./components/app-shell";
import { AdminLoginPage } from "./pages/admin-login-page";
import { AdminPage } from "./pages/admin-page";
import { ContactPage } from "./pages/contact-page";
import { HomePage } from "./pages/home-page";
import { ServicesPage } from "./pages/services-page";
import { TrackOrderPage } from "./pages/track-order-page";
import { UploadPage } from "./pages/upload-page";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/admin/login"
          element={
            <AdminGuestRoute>
              <AdminLoginPage />
            </AdminGuestRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminPage />
            </AdminProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
