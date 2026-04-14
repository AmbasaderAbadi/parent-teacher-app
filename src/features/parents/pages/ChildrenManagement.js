import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Button } from "../../../shared/components/UI/Button";
import { Input } from "../../../shared/components/UI/Input";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiCalendar,
} from "react-icons/fi";
import { studentsAPI, gradesAPI, attendanceAPI } from "../../../services/api";
import toast from "react-hot-toast";

const ChildrenManagement = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childGrades, setChildGrades] = useState([]);
  const [childAttendance, setChildAttendance] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    grade: "",
    className: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem("user");
      let parentId = null;

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        parentId = userData.id;
      }

      // This endpoint needs to be created by your backend teammate
      // For now, we'll use mock data
      // const response = await parentAPI.getChildren(parentId);
      // setChildren(response.data);

      // Mock data for demonstration
      setTimeout(() => {
        const mockChildren = [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            name: "John Doe",
            email: "john.doe@student.com",
            phone: "+1 (555) 123-4567",
            studentId: "STU001",
            grade: "10th Grade",
            className: "Section A",
            dateOfBirth: "2010-05-15",
            address: "123 Main Street",
            attendanceRate: 92,
            averageGrade: 85,
          },
          {
            id: 2,
            firstName: "Emma",
            lastName: "Doe",
            name: "Emma Doe",
            email: "emma.doe@student.com",
            phone: "+1 (555) 234-5678",
            studentId: "STU002",
            grade: "8th Grade",
            className: "Section B",
            dateOfBirth: "2012-08-22",
            address: "123 Main Street",
            attendanceRate: 88,
            averageGrade: 78,
          },
        ];
        setChildren(mockChildren);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error("Failed to load children data");
      setLoading(false);
    }
  };

  const fetchChildDetails = async (childId) => {
    try {
      // Fetch grades for the child
      const gradesResponse = await gradesAPI.getStudentGrades(childId);
      setChildGrades(gradesResponse.data.slice(0, 5));

      // Fetch attendance for the child
      const attendanceResponse =
        await attendanceAPI.getStudentAttendance(childId);
      const attendanceRecords = attendanceResponse.data;
      const presentCount = attendanceRecords.filter(
        (r) => r.status === "present",
      ).length;
      const attendanceRate =
        attendanceRecords.length > 0
          ? Math.round((presentCount / attendanceRecords.length) * 100)
          : 0;

      setChildAttendance(attendanceRecords.slice(0, 10));

      return { attendanceRate };
    } catch (error) {
      console.error("Error fetching child details:", error);
      return { attendanceRate: 0 };
    }
  };

  const handleAddChild = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.studentId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // This endpoint needs to be created by your backend teammate
      // const response = await parentAPI.addChild(formData);

      // Mock adding child
      const newChild = {
        id: children.length + 1,
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        attendanceRate: 0,
        averageGrade: 0,
      };

      setChildren([...children, newChild]);
      toast.success("Child added successfully!");
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding child:", error);
      toast.error(error.response?.data?.message || "Failed to add child");
    }
  };

  const handleUpdateChild = async () => {
    if (!selectedChild || !formData.firstName || !formData.lastName) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // This endpoint needs to be created by your backend teammate
      // const response = await parentAPI.updateChild(selectedChild.id, formData);

      // Mock updating child
      const updatedChildren = children.map((child) =>
        child.id === selectedChild.id
          ? {
              ...child,
              ...formData,
              name: `${formData.firstName} ${formData.lastName}`,
            }
          : child,
      );

      setChildren(updatedChildren);
      toast.success("Child updated successfully!");
      setShowEditModal(false);
      setSelectedChild(null);
      resetForm();
    } catch (error) {
      console.error("Error updating child:", error);
      toast.error(error.response?.data?.message || "Failed to update child");
    }
  };

  const handleDeleteChild = async (childId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this child? This action cannot be undone.",
      )
    ) {
      try {
        // This endpoint needs to be created by your backend teammate
        // await parentAPI.deleteChild(childId);

        // Mock deletion
        setChildren(children.filter((child) => child.id !== childId));
        toast.success("Child removed successfully!");
      } catch (error) {
        console.error("Error deleting child:", error);
        toast.error(error.response?.data?.message || "Failed to delete child");
      }
    }
  };

  const handleViewChild = async (child) => {
    setSelectedChild(child);
    await fetchChildDetails(child.studentId || child.id);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      studentId: "",
      grade: "",
      className: "",
      dateOfBirth: "",
      address: "",
    });
  };

  const openEditModal = (child) => {
    setSelectedChild(child);
    setFormData({
      firstName: child.firstName || child.name?.split(" ")[0] || "",
      lastName: child.lastName || child.name?.split(" ")[1] || "",
      email: child.email || "",
      phone: child.phone || "",
      studentId: child.studentId || "",
      grade: child.grade || "",
      className: child.className || "",
      dateOfBirth: child.dateOfBirth || "",
      address: child.address || "",
    });
    setShowEditModal(true);
  };

  const getGradeColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading children data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Children Management
          </h1>
          <p className="text-gray-600">
            Manage your children's profiles and track their progress
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <FiPlus /> Add Child
        </Button>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <Card
            key={child.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewChild(child)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {child.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {child.studentId}
                    </p>
                  </div>
                </div>
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openEditModal(child)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Child"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteChild(child.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Child"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiBookOpen className="flex-shrink-0" />
                  <span>
                    {child.grade} - {child.className}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="flex-shrink-0" />
                  <span className="truncate">{child.email}</span>
                </div>
                {child.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="flex-shrink-0" />
                    <span>{child.phone}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {child.attendanceRate || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${getGradeColor(child.averageGrade || 0)}`}
                    >
                      {child.averageGrade || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Average Grade</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {children.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No children added yet</p>
            <Button onClick={() => setShowAddModal(true)} variant="primary">
              Add Your First Child
            </Button>
          </div>
        </Card>
      )}

      {/* View Child Modal */}
      {showViewModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedChild.name}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedChild(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{selectedChild.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedChild.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">
                      {selectedChild.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {selectedChild.dateOfBirth || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Grade</p>
                    <p className="font-medium">{selectedChild.grade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="font-medium">{selectedChild.className}</p>
                  </div>
                </div>
              </div>

              {/* Recent Grades */}
              {childGrades.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    Recent Grades
                  </h4>
                  <div className="space-y-2">
                    {childGrades.map((grade, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{grade.subject}</span>
                        <span
                          className={`font-bold ${getGradeColor(grade.score)}`}
                        >
                          {grade.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Attendance */}
              {childAttendance.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">
                    Recent Attendance
                  </h4>
                  <div className="space-y-2">
                    {childAttendance.map((record, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span>{record.date}</span>
                        <span
                          className={`font-medium ${
                            record.status === "present"
                              ? "text-green-600"
                              : record.status === "late"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Child
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Student ID"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grade"
                  placeholder="e.g., 10th Grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                />
                <Input
                  label="Class"
                  placeholder="e.g., Section A"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                />
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />

              <Input
                label="Address (Optional)"
                placeholder="Home address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddChild}>Add Child</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditModal && selectedChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Child
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Student ID"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="Phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grade"
                  placeholder="e.g., 10th Grade"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                />
                <Input
                  label="Class"
                  placeholder="e.g., Section A"
                  value={formData.className}
                  onChange={(e) =>
                    setFormData({ ...formData, className: e.target.value })
                  }
                />
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />

              <Input
                label="Address"
                placeholder="Home address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChild(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateChild}>Save Changes</Button>
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

export default ChildrenManagement;
