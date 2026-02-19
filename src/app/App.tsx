import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/app/components/Login";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { DashboardHome } from "@/app/components/DashboardHome";
import { AtmLogs } from "@/app/components/AtmLogs";
import { Settings } from "@/app/components/Settings";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="logs" element={<AtmLogs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
