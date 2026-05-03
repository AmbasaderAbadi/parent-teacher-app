import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../../../shared/components/UI/Card";
import { Input } from "../../../shared/components/UI/Input";
import { Button } from "../../../shared/components/UI/Button";
import { Table } from "../../../shared/components/UI/Table";
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { adminAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const StudentsPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const columns = [
    { header: t("student_name"), accessor: "name" },
    { header: t("student_id"), accessor: "studentId" },
    { header: t("grade"), accessor: "grade" },
    { header: t("class"), accessor: "className" },
    { header: t("parent"), accessor: "parent" },
    { header: t("attendance"), accessor: "attendance" },
    { header: t("actions"), accessor: "actions" },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsersByRole("student");
      const studentsData = response.data;
      const formattedStudents = studentsData.map((student) => ({
        id: student.id || student._id,
        name: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        studentId: student.studentId || student.id,
        grade: student.grade || t("not_assigned"),
        className: student.className || t("not_assigned"),
        parent: student.parentName || student.parentEmail || t("not_assigned"),
        attendance: `${student.attendanceRate || 0}%`,
        email: student.email,
        phone: student.phone,
        status: student.isActive ? "active" : "inactive",
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(t("failed_load_students_fallback"));

      // fallback demo data (only if needed)
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
          t("student_deleted_success", { name: selectedStudent.name }),
        );
        setShowDeleteModal(false);
        setSelectedStudent(null);
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error(
          error.response?.data?.message || t("failed_delete_student"),
        );
      }
    }
  };

  const handleEditStudent = (student) => {
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
          <p className="mt-4 text-gray-600">{t("loading_students")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t("students")}</h1>
          <p className="text-gray-600">{t("manage_students")}</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => (window.location.href = "/register?role=student")}
        >
          <FiUserPlus /> {t("add_student")}
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder={t("search_students")}
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
                    {t("no_students_found")}
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
                          title={t("edit_student")}
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title={t("delete_student")}
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

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {t("total_students_count", { count: filteredStudents.length })}
            </span>
            <span>
              {t("active_count", {
                count: filteredStudents.filter((s) => s.status !== "inactive")
                  .length,
              })}
            </span>
          </div>
        </div>
      </Card>

      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("confirm_deletion")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("delete_confirmation_message", { name: selectedStudent.name })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t("delete_student")}
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
