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
import { SimpleLayout } from "./layouts/SimpleLayout";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      return <Navigate to="/login" replace />;
    }

    try {
      const userData = JSON.parse(storedUser);
      if (allowedRoles && !allowedRoles.includes(userData.role)) {
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
  };

  // Helper to get role-specific component
  const getRoleComponent = (componentMap) => {
    const role = user?.role;
    return componentMap[role] || componentMap.default;
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e5e7eb",
            borderTopColor: "#4f46e5",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        ></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Protected Routes with MainLayout */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["parent", "teacher", "student", "admin"]}
                />
              }
            >
              <Route element={<MainLayout />}>
                {/* Dashboard Routes */}
                <Route
                  path="/parent-dashboard"
                  element={<ParentDashboard user={user} />}
                />
                <Route
                  path="/teacher-dashboard"
                  element={<TeacherDashboard user={user} />}
                />
                <Route
                  path="/student-dashboard"
                  element={<StudentDashboard user={user} />}
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard user={user} />
                    </ProtectedRoute>
                  }
                />

                {/* /dashboard renders role-specific dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    user?.role === "parent" ? (
                      <ParentDashboard user={user} />
                    ) : user?.role === "teacher" ? (
                      <TeacherDashboard user={user} />
                    ) : user?.role === "admin" ? (
                      <AdminDashboard user={user} />
                    ) : (
                      <StudentDashboard user={user} />
                    )
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminUsersPage user={user} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stats"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminStatsPage user={user} />
                    </ProtectedRoute>
                  }
                />

                {/* Messages - Only for parents and teachers */}
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute allowedRoles={["parent", "teacher"]}>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Profile - All roles */}
                <Route path="/profile" element={<ProfilePage user={user} />} />

                {/* Children Management - Only parents */}
                <Route
                  path="/parent/children"
                  element={
                    <ProtectedRoute allowedRoles={["parent"]}>
                      <ChildrenManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Class Management - Only teachers */}
                <Route
                  path="/teacher/class"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <ClassManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Student Profile - Parents and Teachers */}
                <Route
                  path="/student-profile"
                  element={
                    <ProtectedRoute allowedRoles={["parent", "teacher"]}>
                      <StudentProfilePage user={user} />
                    </ProtectedRoute>
                  }
                />

                {/* My Grades & Attendance - Only students */}
                <Route
                  path="/student/grades"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <MyGrades />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/attendance"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <MyAttendance />
                    </ProtectedRoute>
                  }
                />

                {/* Materials - Role-specific */}
                <Route
                  path="/materials"
                  element={
                    user?.role === "teacher" ? (
                      <ProtectedRoute allowedRoles={["teacher"]}>
                        <TeacherMaterialsPage user={user} />
                      </ProtectedRoute>
                    ) : user?.role === "student" ? (
                      <ProtectedRoute allowedRoles={["student"]}>
                        <StudentMaterialsPage user={user} />
                      </ProtectedRoute>
                    ) : user?.role === "parent" ? (
                      <ProtectedRoute allowedRoles={["parent"]}>
                        <ParentMaterialsPage user={user} />
                      </ProtectedRoute>
                    ) : null
                  }
                />

                {/* Homework - Role-specific */}
                <Route
                  path="/homework"
                  element={
                    user?.role === "teacher" ? (
                      <ProtectedRoute allowedRoles={["teacher"]}>
                        <TeacherHomeworkPage user={user} />
                      </ProtectedRoute>
                    ) : user?.role === "student" ? (
                      <ProtectedRoute allowedRoles={["student"]}>
                        <StudentHomeworkPage user={user} />
                      </ProtectedRoute>
                    ) : user?.role === "parent" ? (
                      <ProtectedRoute allowedRoles={["parent"]}>
                        <ParentHomeworkPage user={user} />
                      </ProtectedRoute>
                    ) : null
                  }
                />

                {/* Announcements - Role-specific */}
                <Route
                  path="/announcements"
                  element={
                    user?.role === "admin" ? (
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminAnnouncementsPage user={user} />
                      </ProtectedRoute>
                    ) : (
                      <ProtectedRoute
                        allowedRoles={["parent", "teacher", "student"]}
                      >
                        <UserAnnouncementsPage user={user} />
                      </ProtectedRoute>
                    )
                  }
                />

                {/* Calendar - Role-specific */}
                <Route
                  path="/calendar"
                  element={
                    user?.role === "admin" ? (
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <AdminCalendarPage user={user} />
                      </ProtectedRoute>
                    ) : (
                      <ProtectedRoute
                        allowedRoles={["parent", "teacher", "student"]}
                      >
                        <UserCalendarPage user={user} />
                      </ProtectedRoute>
                    )
                  }
                />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
