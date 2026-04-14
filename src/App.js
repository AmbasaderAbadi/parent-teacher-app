import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { MainLayout } from "./layouts/MainLayout";
import { authAPI } from "./services/api";

// Public Pages
import HomePage from "./features/home/pages/HomePage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import AboutUs from "./features/home/pages/AboutUs";
import ContactUs from "./features/home/pages/ContactUs";

// Dashboard Pages
import ParentDashboard from "./features/parents/pages/ParentDashboard";
import TeacherDashboard from "./features/teachers/pages/TeacherDashboard";
import StudentDashboard from "./features/students/pages/StudentDashboard";
import AdminDashboard from "./features/admin/pages/AdminDashboard";

// Feature Pages
import MessagesPage from "./features/messaging/pages/MessagesPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import ChildrenManagement from "./features/parents/pages/ChildrenManagement";
import ClassManagement from "./features/teachers/pages/ClassManagement";
import MyGrades from "./features/students/pages/MyGrades";
import MyAttendance from "./features/students/pages/MyAttendance";
import StudentProfilePage from "./features/students/pages/StudentProfilePage";

// Role-Specific Pages
import TeacherMaterialsPage from "./features/materials/pages/TeacherMaterialsPage";
import StudentMaterialsPage from "./features/materials/pages/StudentMaterialsPage";
import ParentMaterialsPage from "./features/materials/pages/ParentMaterialsPage";
import TeacherHomeworkPage from "./features/homework/pages/TeacherHomeworkPage";
import StudentHomeworkPage from "./features/homework/pages/StudentHomeworkPage";
import ParentHomeworkPage from "./features/homework/pages/ParentHomeworkPage";
import AdminAnnouncementsPage from "./features/announcements/pages/AdminAnnouncementsPage";
import UserAnnouncementsPage from "./features/announcements/pages/UserAnnouncementsPage";
import AdminCalendarPage from "./features/calendar/pages/AdminCalendarPage";
import UserCalendarPage from "./features/calendar/pages/UserCalendarPage";

// Admin Pages
import AdminUsersPage from "./features/admin/pages/AdminUsersPage";
import AdminStatsPage from "./features/admin/pages/AdminStatsPage";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        const userData = response.data;

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userRole", userData.role);
      } catch (error) {
        console.warn("⚠️ Profile fetch failed, keeping existing session");

        // ❌ DO NOT CLEAR STORAGE
        // Instead just keep existing user
      }

      setLoading(false);
    };

    validateSession();
  }, []);

  // ✅ Protected Route
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    let userData = null;

    try {
      userData = storedUser ? JSON.parse(storedUser) : null;
    } catch {
      console.error("Invalid user JSON");
    }

    // Allow access if token exists (even if profile failed)
    if (!userData) {
      return children ? children : <Outlet />;
    }

    if (allowedRoles && !allowedRoles.includes(userData.role)) {
      const roleDashboard = {
        parent: "/parent-dashboard",
        teacher: "/teacher-dashboard",
        student: "/student-dashboard",
        admin: "/admin-dashboard",
      };
      return <Navigate to={roleDashboard[userData.role]} replace />;
    }

    return children ? children : <Outlet />;
  };

  // ✅ Role Routers (FIXED)
  const DashboardRouter = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    switch (user.role) {
      case "parent":
        return <ParentDashboard />;
      case "teacher":
        return <TeacherDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  const MaterialsRouter = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    switch (user.role) {
      case "teacher":
        return <TeacherMaterialsPage />;
      case "student":
        return <StudentMaterialsPage />;
      case "parent":
        return <ParentMaterialsPage />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  const HomeworkRouter = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    switch (user.role) {
      case "teacher":
        return <TeacherHomeworkPage />;
      case "student":
        return <StudentHomeworkPage />;
      case "parent":
        return <ParentHomeworkPage />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  const AnnouncementsRouter = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role === "admin" ? (
      <AdminAnnouncementsPage />
    ) : (
      <UserAnnouncementsPage />
    );
  };

  const CalendarRouter = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role === "admin" ? <AdminCalendarPage /> : <UserCalendarPage />;
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Protected */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["parent", "teacher", "student", "admin"]}
                />
              }
            >
              <Route element={<MainLayout />}>
                {/* Dashboards */}
                <Route path="/parent-dashboard" element={<ParentDashboard />} />
                <Route
                  path="/teacher-dashboard"
                  element={<TeacherDashboard />}
                />
                <Route
                  path="/student-dashboard"
                  element={<StudentDashboard />}
                />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                <Route path="/dashboard" element={<DashboardRouter />} />

                {/* Admin */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stats"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminStatsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Features */}
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route
                  path="/parent/children"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <ChildrenManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/teacher/class"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <ClassManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student-profile/:studentId?"
                  element={
                    <ProtectedRoute allowedRoles={["parent", "teacher"]}>
                      <StudentProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/student/grades" element={<MyGrades />} />
                <Route path="/student/attendance" element={<MyAttendance />} />

                {/* Role Based */}
                <Route path="/materials" element={<MaterialsRouter />} />
                <Route path="/homework" element={<HomeworkRouter />} />
                <Route
                  path="/announcements"
                  element={<AnnouncementsRouter />}
                />
                <Route path="/calendar" element={<CalendarRouter />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
