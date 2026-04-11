import React, { useState } from "react";
import { Card } from "../../../shared/components/UI/Card";

const MyAttendance = () => {
  const [currentMonth] = useState(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const attendanceStats = {
    present: 18,
    absent: 2,
    late: 1,
    total: 21,
    rate: 86,
  };

  // Sample attendance data for the month
  const getAttendanceStatus = (day) => {
    // This would come from API in real app
    if (day % 5 === 0) return "absent";
    if (day % 7 === 0) return "late";
    return "present";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-600">Track your attendance record</p>
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
            const status = getAttendanceStatus(day);
            const statusColor = getStatusColor(status);

            return (
              <div key={i} className="text-center p-1">
                <div className={`p-2 rounded-lg ${statusColor}`}>
                  <span className="text-sm">{day}</span>
                  <div className="text-xs font-bold">
                    {getStatusLabel(status)}
                  </div>
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
        </div>
      </Card>
    </div>
  );
};

export default MyAttendance;
