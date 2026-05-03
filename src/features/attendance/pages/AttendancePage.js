import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { useTranslation } from "react-i18next";
import { attendanceAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const AttendancePage = () => {
  const { t } = useTranslation();
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
  const [userRole, setUserRole] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);

  const days = [
    t("sun"),
    t("mon"),
    t("tue"),
    t("wed"),
    t("thu"),
    t("fri"),
    t("sat"),
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (userRole) fetchAttendance();
  }, [userRole]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let response;

      if (userRole === "student") {
        response = await attendanceAPI.getMyAttendance();
      } else if (userRole === "parent") {
        response = await attendanceAPI.getMyAttendance();
      } else if (userRole === "teacher") {
        response = await attendanceAPI.getTodayAttendance();
      } else {
        response = { data: [] };
      }

      const attendanceData = response.data || [];

      const formattedRecords = attendanceData.map((record) => ({
        id: record.id || record._id,
        date: record.date,
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
      }));

      setAttendanceRecords(formattedRecords);
      calculateStats(formattedRecords);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error(t("failed_load_attendance"));
      setAttendanceRecords([]);
      calculateStats([]);
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

  const getAttendanceStatusForDay = (day) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = attendanceRecords.find((r) => r.date === dateStr);
    return record;
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
        return "bg-gray-100 text-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "present":
        return t("present_short");
      case "absent":
        return t("absent_short");
      case "late":
        return t("late_short");
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("attendance")}
          </h1>
          <p className="text-gray-600">{t("track_attendance")}</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading_attendance")}</p>
          </div>
        </div>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t("attendance")}</h1>
        <p className="text-gray-600">{t("track_attendance")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("present")}</p>
            <p className="text-2xl font-bold text-green-600">
              {attendanceStats.present}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("absent")}</p>
            <p className="text-2xl font-bold text-red-600">
              {attendanceStats.absent}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("late")}</p>
            <p className="text-2xl font-bold text-yellow-600">
              {attendanceStats.late}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("attendance_rate")}</p>
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
            {currentMonth.toLocaleString(t("locale"), {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
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
            const record = getAttendanceStatusForDay(day);
            const statusColor = record
              ? getStatusColor(record.status)
              : "bg-gray-50 text-gray-400";
            const statusLabel = record ? getStatusLabel(record.status) : "";

            return (
              <div
                key={i}
                className={`text-center p-2 border rounded-lg ${statusColor} transition-all duration-200 hover:shadow-md`}
              >
                <div className="text-sm font-medium">{day}</div>
                {statusLabel && (
                  <div className="text-xs font-bold mt-1">{statusLabel}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">{t("present")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">{t("absent")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">{t("late")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-xs text-gray-600">{t("no_data")}</span>
          </div>
        </div>

        {attendanceRecords.length === 0 && !loading && (
          <div className="mt-4 text-center text-gray-500">
            <p>{t("no_records_month")}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
