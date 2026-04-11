import React, { useState } from "react";
import { Card } from "../../../shared/components/UI/Card";

export const AttendancePage = () => {
  const [currentMonth] = useState(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const attendanceStats = {
    present: 18,
    absent: 2,
    late: 1,
    total: 21,
    rate: 86,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="text-gray-600">Track attendance records</p>
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
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div
              key={day}
              className="text-center font-medium text-gray-600 p-2"
            >
              {day}
            </div>
          ))}
          {[...Array(31)].map((_, i) => (
            <div
              key={i}
              className="text-center p-2 border rounded-lg hover:bg-gray-50"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
