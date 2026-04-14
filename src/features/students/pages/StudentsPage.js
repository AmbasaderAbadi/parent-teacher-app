import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Input } from "../../../shared/components/UI/Input";
import { Button } from "../../../shared/components/UI/Button";
import { Table } from "../../../shared/components/UI/Table";
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { adminAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const columns = [
    { header: "Student Name", accessor: "name" },
    { header: "Student ID", accessor: "studentId" },
    { header: "Grade", accessor: "grade" },
    { header: "Class", accessor: "className" },
    { header: "Parent", accessor: "parent" },
    { header: "Attendance", accessor: "attendance" },
    { header: "Actions", accessor: "actions" },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch users with role "student"
      const response = await adminAPI.getUsersByRole("student");
      const studentsData = response.data;

      // Transform API data to match component structure
      const formattedStudents = studentsData.map((student) => ({
        id: student.id || student._id,
        name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        studentId: student.studentId || student.id,
        grade: student.grade || "Not assigned",
        className: student.className || "Not assigned",
        parent: student.parentName || student.parentEmail || "Not assigned",
        attendance: `${student.attendanceRate || 0}%`,
        email: student.email,
        phone: student.phone,
        status: student.isActive ? "active" : "inactive",
      }));

      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students. Using demo data.");

      // Fallback to demo data
      setStudents([
        {
          id: 1,
          name: "John Doe",
          studentId: "STU001",
          grade: "8th",
          className: "Class A",
          parent: "Jane Doe",
          attendance: "92%",
          email: "john@student.com",
          status: "active",
        },
        {
          id: 2,
          name: "Jane Smith",
          studentId: "STU002",
          grade: "8th",
          className: "Class A",
          parent: "John Smith",
          attendance: "88%",
          email: "jane@student.com",
          status: "active",
        },
        {
          id: 3,
          name: "Mike Johnson",
          studentId: "STU003",
          grade: "8th",
          className: "Class B",
          parent: "Sarah Johnson",
          attendance: "95%",
          email: "mike@student.com",
          status: "active",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (selectedStudent) {
      try {
        await adminAPI.deleteUser(selectedStudent.id);
        toast.success(
          `${selectedStudent.name} has been removed from the system`,
        );
        setShowDeleteModal(false);
        setSelectedStudent(null);
        fetchStudents(); // Refresh the list
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete student",
        );
      }
    }
  };

  const handleEditStudent = (student) => {
    // Navigate to student profile page for editing
    window.location.href = `/student-profile/${student.id}`;
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-600">Manage student records</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => (window.location.href = "/register?role=student")}
        >
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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          parseInt(student.attendance) >= 90
                            ? "bg-green-100 text-green-600"
                            : parseInt(student.attendance) >= 75
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {student.attendance}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Student"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Student"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total Students: {filteredStudents.length}</span>
            <span>
              Active:{" "}
              {filteredStudents.filter((s) => s.status !== "inactive").length}
            </span>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{selectedStudent.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

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
};
