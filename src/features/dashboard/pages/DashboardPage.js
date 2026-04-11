import React from "react";
import { Card } from "../../../shared/components/UI/Card";
import { useAuthStore } from "../../../store/authStore";

export const DashboardPage = () => {
  const { user } = useAuthStore();

  const stats = [
    { title: "Total Students", value: "0", color: "blue" },
    { title: "Average Grade", value: "0%", color: "green" },
    { title: "Attendance Rate", value: "0%", color: "purple" },
    { title: "Unread Messages", value: "0", color: "orange" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors">
            📝 View Grades
          </button>
          <button className="p-4 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors">
            📅 Check Attendance
          </button>
          <button className="p-4 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors">
            💬 Send Message
          </button>
          <button className="p-4 bg-orange-50 rounded-lg text-orange-600 hover:bg-orange-100 transition-colors">
            📚 View Materials
          </button>
        </div>
      </Card>
    </div>
  );
};
