import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Button } from "../../../shared/components/UI/Button";
import { Input } from "../../../shared/components/UI/Input";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiBookOpen,
  FiCalendar,
} from "react-icons/fi";
import { adminAPI } from "../../../services/api";
import toast from "react-hot-toast";

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    className: "",
    grade: "",
    section: "",
    teacherId: "",
    academicYear: new Date().getFullYear().toString(),
    roomNumber: "",
    capacity: "",
  });
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      // This endpoint may need to be created by your backend teammate
      // For now, we'll use a mock implementation
      // const response = await teacherAPI.getClasses();
      // setClasses(response.data);

      // Mock data for demonstration
      setTimeout(() => {
        const mockClasses = [
          {
            id: 1,
            className: "Class A",
            grade: "10th",
            section: "A",
            teacherName: "Mr. Smith",
            teacherId: "teacher123",
            studentCount: 25,
            capacity: 30,
            roomNumber: "101",
            academicYear: "2024",
          },
          {
            id: 2,
            className: "Class B",
            grade: "10th",
            section: "B",
            teacherName: "Mrs. Johnson",
            teacherId: "teacher456",
            studentCount: 23,
            capacity: 30,
            roomNumber: "102",
            academicYear: "2024",
          },
          {
            id: 3,
            className: "Class C",
            grade: "9th",
            section: "A",
            teacherName: "Ms. Davis",
            teacherId: "teacher789",
            studentCount: 28,
            capacity: 30,
            roomNumber: "103",
            academicYear: "2024",
          },
        ];
        setClasses(mockClasses);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to load classes");
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getUsersByRole("teacher");
      const teachersData = response.data;
      const formattedTeachers = teachersData.map((teacher) => ({
        id: teacher.id || teacher._id,
        name: `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
        email: teacher.email,
      }));
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      // Mock teachers for demo
      setTeachers([
        { id: "teacher123", name: "Mr. Smith", email: "smith@school.com" },
        { id: "teacher456", name: "Mrs. Johnson", email: "johnson@school.com" },
        { id: "teacher789", name: "Ms. Davis", email: "davis@school.com" },
      ]);
    }
  };

  const handleCreateClass = async () => {
    if (!formData.className || !formData.grade || !formData.section) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // This endpoint may need to be created
      // const response = await teacherAPI.createClass(formData);
      // toast.success("Class created successfully!");

      // Mock creation
      const newClass = {
        id: classes.length + 1,
        className: formData.className,
        grade: formData.grade,
        section: formData.section,
        teacherName:
          teachers.find((t) => t.id === formData.teacherId)?.name ||
          "Not assigned",
        teacherId: formData.teacherId,
        studentCount: 0,
        capacity: formData.capacity || 30,
        roomNumber: formData.roomNumber,
        academicYear: formData.academicYear,
      };

      setClasses([...classes, newClass]);
      toast.success("Class created successfully!");
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error(error.response?.data?.message || "Failed to create class");
    }
  };

  const handleUpdateClass = async () => {
    if (!selectedClass || !formData.className) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // This endpoint may need to be created
      // const response = await teacherAPI.updateClass(selectedClass.id, formData);

      // Mock update
      const updatedClasses = classes.map((cls) =>
        cls.id === selectedClass.id
          ? {
              ...cls,
              className: formData.className,
              grade: formData.grade,
              section: formData.section,
              teacherId: formData.teacherId,
              teacherName:
                teachers.find((t) => t.id === formData.teacherId)?.name ||
                cls.teacherName,
              roomNumber: formData.roomNumber,
              capacity: formData.capacity,
              academicYear: formData.academicYear,
            }
          : cls,
      );

      setClasses(updatedClasses);
      toast.success("Class updated successfully!");
      setShowEditModal(false);
      setSelectedClass(null);
      resetForm();
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error(error.response?.data?.message || "Failed to update class");
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        // This endpoint may need to be created
        // await teacherAPI.deleteClass(classId);

        // Mock deletion
        setClasses(classes.filter((cls) => cls.id !== classId));
        toast.success("Class deleted successfully!");
      } catch (error) {
        console.error("Error deleting class:", error);
        toast.error(error.response?.data?.message || "Failed to delete class");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      className: "",
      grade: "",
      section: "",
      teacherId: "",
      academicYear: new Date().getFullYear().toString(),
      roomNumber: "",
      capacity: "",
    });
  };

  const openEditModal = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      className: classItem.className,
      grade: classItem.grade,
      section: classItem.section,
      teacherId: classItem.teacherId || "",
      academicYear: classItem.academicYear,
      roomNumber: classItem.roomNumber || "",
      capacity: classItem.capacity?.toString() || "",
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
          <p className="text-gray-600">Manage your classes and assignments</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <FiPlus /> Create Class
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card
            key={classItem.id}
            className="hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {classItem.className}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Grade {classItem.grade} - Section {classItem.section}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(classItem)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Class"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Class"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUsers className="flex-shrink-0" />
                  <span>
                    Teacher: {classItem.teacherName || "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiBookOpen className="flex-shrink-0" />
                  <span>
                    Students: {classItem.studentCount || 0}/
                    {classItem.capacity || 30}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar className="flex-shrink-0" />
                  <span>Academic Year: {classItem.academicYear}</span>
                </div>
                {classItem.roomNumber && (
                  <div className="text-sm text-gray-600">
                    Room: {classItem.roomNumber}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${((classItem.studentCount || 0) / (classItem.capacity || 30)) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(
                    ((classItem.studentCount || 0) /
                      (classItem.capacity || 30)) *
                      100,
                  )}
                  % capacity
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No classes created yet</p>
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              Create Your First Class
            </Button>
          </div>
        </Card>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Class
            </h3>

            <div className="space-y-4">
              <Input
                label="Class Name"
                placeholder="e.g., Class A, Mathematics 101"
                value={formData.className}
                onChange={(e) =>
                  setFormData({ ...formData, className: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grade"
                  placeholder="e.g., 10th"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  required
                />
                <Input
                  label="Section"
                  placeholder="e.g., A"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Room Number"
                  placeholder="e.g., 101"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                />
                <Input
                  label="Capacity"
                  type="number"
                  placeholder="Max students"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Teacher
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Academic Year"
                placeholder="e.g., 2024"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>Create Class</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Class
            </h3>

            <div className="space-y-4">
              <Input
                label="Class Name"
                placeholder="e.g., Class A, Mathematics 101"
                value={formData.className}
                onChange={(e) =>
                  setFormData({ ...formData, className: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Grade"
                  placeholder="e.g., 10th"
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: e.target.value })
                  }
                  required
                />
                <Input
                  label="Section"
                  placeholder="e.g., A"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Room Number"
                  placeholder="e.g., 101"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                />
                <Input
                  label="Capacity"
                  type="number"
                  placeholder="Max students"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Teacher
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Academic Year"
                placeholder="e.g., 2024"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedClass(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateClass}>Save Changes</Button>
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

export default ClassManagement;
