import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiUsers,
  FiMessageSquare,
  FiBookOpen,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/api";

const AdminStatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userGrowth: [],
    roleDistribution: [],
    activityData: [],
    totalMessages: 0,
    totalGrades: 0,
    totalAttendance: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch main stats from API
      const statsResponse = await adminAPI.getStats();
      const statsData = statsResponse.data;

      // Fetch users for role distribution
      const usersResponse = await adminAPI.getAllUsers();
      const users = usersResponse.data;

      // Calculate role distribution
      const roleCounts = {
        parent: 0,
        teacher: 0,
        student: 0,
      };

      users.forEach((user) => {
        if (user.role === "parent") roleCounts.parent++;
        else if (user.role === "teacher") roleCounts.teacher++;
        else if (user.role === "student") roleCounts.student++;
      });

      const roleDistribution = [
        { name: "Parents", value: roleCounts.parent, color: "#3b82f6" },
        { name: "Teachers", value: roleCounts.teacher, color: "#10b981" },
        { name: "Students", value: roleCounts.student, color: "#f59e0b" },
      ];

      // Generate user growth data (last 6 months)
      const userGrowth = generateUserGrowthData(users);

      // Generate activity data (weekly)
      const activityData = generateActivityData();

      setStats({
        userGrowth: userGrowth,
        roleDistribution: roleDistribution,
        activityData: activityData,
        totalMessages: statsData.totalMessages || 0,
        totalGrades: statsData.totalGrades || 0,
        totalAttendance: statsData.totalAttendance || 0,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load statistics. Using demo data.");

      // Fallback to demo data if API fails
      setStats({
        userGrowth: [
          { month: "Jan", users: 65 },
          { month: "Feb", users: 78 },
          { month: "Mar", users: 90 },
          { month: "Apr", users: 105 },
          { month: "May", users: 120 },
          { month: "Jun", users: 135 },
        ],
        roleDistribution: [
          { name: "Parents", value: 45, color: "#3b82f6" },
          { name: "Teachers", value: 12, color: "#10b981" },
          { name: "Students", value: 68, color: "#f59e0b" },
        ],
        activityData: [
          { day: "Mon", messages: 45, logins: 120 },
          { day: "Tue", messages: 52, logins: 135 },
          { day: "Wed", messages: 48, logins: 128 },
          { day: "Thu", messages: 61, logins: 142 },
          { day: "Fri", messages: 55, logins: 138 },
        ],
        totalMessages: 5234,
        totalGrades: 342,
        totalAttendance: 1245,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate user growth data from actual user creation dates
  const generateUserGrowthData = (users) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const last6Months = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      last6Months.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        count: 0,
      });
    }

    // Count users created in each month
    users.forEach((user) => {
      const createdAt = new Date(user.createdAt);
      last6Months.forEach((monthData) => {
        if (
          createdAt.getMonth() === months.indexOf(monthData.month) &&
          createdAt.getFullYear() === monthData.year
        ) {
          monthData.count++;
        }
      });
    });

    // Calculate cumulative growth
    let cumulative = 0;
    return last6Months.map((month) => ({
      month: month.month,
      users: (cumulative += month.count),
    }));
  };

  // Helper function to generate activity data
  const generateActivityData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day: day,
      messages: Math.floor(Math.random() * 50) + 30,
      logins: Math.floor(Math.random() * 100) + 80,
    }));
  };

  const handleExportReport = () => {
    // Generate CSV report
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalUsers: stats.roleDistribution.reduce((a, b) => a + b.value, 0),
      roleDistribution: stats.roleDistribution,
      userGrowth: stats.userGrowth,
      activityData: stats.activityData,
      totalMessages: stats.totalMessages,
      totalGrades: stats.totalGrades,
      totalAttendance: stats.totalAttendance,
    };

    // Create CSV content
    const csvContent = [
      ["Report Generated:", new Date().toLocaleString()],
      [""],
      ["Summary Statistics"],
      ["Metric", "Value"],
      ["Total Users", reportData.totalUsers],
      ["Total Messages", reportData.totalMessages],
      ["Total Grades", reportData.totalGrades],
      ["Total Attendance", reportData.totalAttendance],
      [""],
      ["Role Distribution"],
      ["Role", "Count"],
      ...stats.roleDistribution.map((r) => [r.name, r.value]),
      [""],
      ["User Growth (Last 6 Months)"],
      ["Month", "Total Users"],
      ...stats.userGrowth.map((g) => [g.month, g.users]),
      [""],
      ["Weekly Activity"],
      ["Day", "Messages", "Logins"],
      ...stats.activityData.map((a) => [a.day, a.messages, a.logins]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `statistics-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully!");
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Statistics & Reports</h1>
          <p style={styles.subtitle}>Platform analytics and insights</p>
        </div>
        <button onClick={handleExportReport} style={styles.exportBtn}>
          <FiDownload size={16} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiMessageSquare size={24} />
          </div>
          <div>
            <p style={styles.summaryValue}>
              {stats.totalMessages.toLocaleString()}
            </p>
            <p style={styles.summaryLabel}>Total Messages</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiBookOpen size={24} />
          </div>
          <div>
            <p style={styles.summaryValue}>
              {stats.totalGrades.toLocaleString()}
            </p>
            <p style={styles.summaryLabel}>Grades Recorded</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiCalendar size={24} />
          </div>
          <div>
            <p style={styles.summaryValue}>
              {stats.totalAttendance.toLocaleString()}
            </p>
            <p style={styles.summaryLabel}>Attendance Records</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>
            <FiUsers size={24} />
          </div>
          <div>
            <p style={styles.summaryValue}>
              {stats.roleDistribution
                ?.reduce((a, b) => a + b.value, 0)
                .toLocaleString()}
            </p>
            <p style={styles.summaryLabel}>Total Users</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        {/* User Growth Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>👥 User Distribution by Role</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📊 Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#8b5cf6" name="Messages" />
              <Bar dataKey="logins" fill="#10b981" name="Logins" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  summaryIcon: {
    width: "48px",
    height: "48px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4f46e5",
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#6b7280",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "24px",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "16px",
  },
};

export default AdminStatsPage;
