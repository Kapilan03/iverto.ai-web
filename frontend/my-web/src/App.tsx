import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";
import RoleGuard from "./components/RoleGuard";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StudentProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "DM Sans, sans-serif",
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <RoleGuard allowedRoles={["admin", "staff", "parent"]}>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </RoleGuard>
              }
            />

            <Route
              path="/students"
              element={
                <RoleGuard allowedRoles={["admin", "staff"]}>
                  <AppLayout>
                    <StudentsPage />
                  </AppLayout>
                </RoleGuard>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </StudentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
