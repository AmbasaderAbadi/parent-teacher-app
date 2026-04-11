import React, { useState } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Input } from "../../../shared/components/UI/Input";
import { Button } from "../../../shared/components/UI/Button";
import { Table } from "../../../shared/components/UI/Table";
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { header: "Student Name", accessor: "name" },
    { header: "Student ID", accessor: "studentId" },
    { header: "Grade", accessor: "grade" },
    { header: "Class", accessor: "className" },
    { header: "Parent", accessor: "parent" },
    { header: "Attendance", accessor: "attendance" },
    { header: "Actions", accessor: "actions" },
  ];

  const students = [
    {
      name: "John Doe",
      studentId: "STU001",
      grade: "8th",
      className: "Class A",
      parent: "Jane Doe",
      attendance: "92%",
    },
    {
      name: "Jane Smith",
      studentId: "STU002",
      grade: "8th",
      className: "Class A",
      parent: "John Smith",
      attendance: "88%",
    },
    {
      name: "Mike Johnson",
      studentId: "STU003",
      grade: "8th",
      className: "Class B",
      parent: "Sarah Johnson",
      attendance: "95%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-600">Manage student records</p>
        </div>
        <Button className="flex items-center gap-2">
          <FiUserPlus /> Add Student
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search students by name or ID..."
            icon={<FiSearch />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.studentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.grade}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.className}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.parent}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                      {student.attendance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <FiEdit2 size={16} />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
