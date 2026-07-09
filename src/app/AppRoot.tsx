import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { setOnUnauthorized } from "@/api/axios";
import { useAuth } from "@/store/auth";
import { AuthLayout } from "./layouts/AuthLayout";
import { AdminLayout, StudentLayout } from "./layouts/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { PlaceholderPage } from "./pages/PlaceholderPage";

function RootRedirect() {
  const hydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.accessToken);
  const user = useAuth((s) => s.user);
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "ELECTION_OFFICER";
  return <Navigate to={isAdmin ? "/admin" : "/student"} replace />;
}

export function AppRoot() {
  useEffect(() => {
    setOnUnauthorized(() => {
      useAuth.getState().clear();
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["ADMIN", "SUPER_ADMIN", "ELECTION_OFFICER"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="elections" element={<PlaceholderPage title="Elections" />} />
            <Route path="positions" element={<PlaceholderPage title="Positions" />} />
            <Route path="candidates" element={<PlaceholderPage title="Candidates" />} />
            <Route path="students" element={<PlaceholderPage title="Students" />} />
            <Route path="officers" element={<PlaceholderPage title="Election Officers" />} />
            <Route path="results" element={<PlaceholderPage title="Results" />} />
            <Route path="audit" element={<PlaceholderPage title="Audit Logs" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="elections" element={<PlaceholderPage title="Elections" />} />
            <Route path="vote/:electionId" element={<PlaceholderPage title="Cast your vote" />} />
            <Route path="history" element={<PlaceholderPage title="Voting History" />} />
            <Route path="results" element={<PlaceholderPage title="Results" />} />
            <Route path="profile" element={<PlaceholderPage title="Profile" />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}