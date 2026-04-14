import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { attendanceAPI } from "../../../services/api";
import toast from "react-hot-toast";

const MyAttendance = () => {
  const [currentMonth] = useState(new Date());
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    rate: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentUser, setStudentUser] = useState(null);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudentUser(userData);
      }

      // Fetch attendance records from API
      const response = await attendanceAPI.getMyAttendance();
      const records = response.data;

      setAttendanceRecords(records);

      // Calculate statistics from the records
      calculateStats(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance data. Using demo data.");

      // Fallback to demo data
      const demoRecords = generateDemoAttendance();
      setAttendanceRecords(demoRecords);
      calculateStats(demoRecords);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const total = records.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    setAttendanceStats({
      present,
      absent,
      late,
      total,
      rate,
    });
  };

  const generateDemoAttendance = () => {
    const demoRecords = [];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Generate records for the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Generate random status for demo
      let status = "present";
      if (day % 7 === 0) status = "late";
      if (day % 10 === 0) status = "absent";

      demoRecords.push({
        id: day,
        date: date.toISOString().split("T")[0],
        status: status,
        checkIn: status !== "absent" ? "8:30 AM" : "-",
        checkOut: status !== "absent" ? "3:30 PM" : "-",
      });
    }

    return demoRecords;
  };

  const getAttendanceStatusForDay = (day) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const record = attendanceRecords.find((r) => r.date === dateStr);
    return record ? record.status : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-600";
      case "absent":
        return "bg-red-100 text-red-600";
      case "late":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "present":
        return "P";
      case "absent":
        return "A";
      case "late":
        return "L";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-600">
          Track your attendance record for {studentUser?.firstName || "Student"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">
              {attendanceStats.present}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">
              {attendanceStats.absent}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-2xl font-bold text-yellow-600">
              {attendanceStats.late}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {attendanceStats.rate}%
            </p>
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-600 p-2 text-sm"
            >
              {day}
            </div>
          ))}
          {[...Array(31)].map((_, i) => {
            const day = i + 1;
            const status = getAttendanceStatusForDay(day);
            const statusColor = status
              ? getStatusColor(status)
              : "bg-gray-50 text-gray-400";
            const statusLabel = status ? getStatusLabel(status) : "";

            return (
              <div key={i} className="text-center p-1">
                <div className={`p-2 rounded-lg ${statusColor}`}>
                  <span className="text-sm">{day}</span>
                  {statusLabel && (
                    <div className="text-xs font-bold">{statusLabel}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-600">No Data</span>
          </div>
        </div>

        {attendanceRecords.length === 0 && !loading && (
          <div className="mt-4 text-center text-gray-500">
            <p>No attendance records found for this month.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyAttendance;
