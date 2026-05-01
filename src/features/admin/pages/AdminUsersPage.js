import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiUserPlus,
  FiFilter,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { adminAPI } from "../../../services/api";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivateModal, setShowActivateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all users (since role endpoint may be missing)
      const response = await adminAPI.getAllUsers();
      // Extract nested data array
      const usersData = response.data?.data || response.data || [];
      const usersList = Array.isArray(usersData) ? usersData : [];

      const formattedUsers = usersList.map((user) => ({
        id: user.id || user._id,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.name ||
          user.email ||
          "Unknown",
        email: user.email || "No email",
        userId:
          user.teacherId || user.studentId || user.parentId || user.id || "N/A",
        role: user.role || "unknown",
        status: user.isActive ? "active" : "inactive",
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side role filtering (since backend role endpoint may be missing)
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await adminAPI.deleteUser(selectedUser.id);
        toast.success(`${selectedUser.name} has been removed from the system`);
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleActivateUser = async () => {
    if (selectedUser) {
      try {
        await adminAPI.activateUser(selectedUser.id);
        toast.success(`${selectedUser.name} has been activated`);
        setShowActivateModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error("Error activating user:", error);
        toast.error(error.response?.data?.message || "Failed to activate user");
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "parent":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "teacher":
        return { bg: "#d1fae5", color: "#065f46" };
      case "student":
        return { bg: "#fed7aa", color: "#92400e" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  // The JSX remains exactly the same as in your original code
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👥 User Management</h1>
          <p style={styles.subtitle}>
            Manage all users (Parents, Teachers, Students)
          </p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => (window.location.href = "/register")}
        >
          <FiUserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.searchWrapper}>
          <FiSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.roleFilter}>
          <FiFilter size={16} />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={styles.roleSelect}
          >
            <option value="all">All Roles</option>
            <option value="parent">Parents</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>User ID</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Joined Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={styles.loadingCell}>
                  <div style={styles.spinner} />
                  <p>Loading users...</p>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyCell}>
                  <p>No users found</p>
                  {searchTerm && (
                    <p style={styles.emptySubtext}>Try adjusting your search</p>
                  )}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const roleBadge = getRoleBadgeColor(user.role);
                return (
                  <tr key={user.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{user.name}</strong>
                    </td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.userId}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.roleBadge,
                          backgroundColor: roleBadge.bg,
                          color: roleBadge.color,
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            user.status === "active" ? "#d1fae5" : "#fee2e2",
                          color:
                            user.status === "active" ? "#065f46" : "#991b1b",
                          cursor:
                            user.status === "inactive" ? "pointer" : "default",
                        }}
                        onClick={() => {
                          if (user.status === "inactive") {
                            setSelectedUser(user);
                            setShowActivateModal(true);
                          }
                        }}
                      >
                        {user.status}
                        {user.status === "inactive" && " (Click to activate)"}
                      </span>
                    </td>
                    <td style={styles.td}>{user.joinedDate}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          style={styles.editBtn}
                          title="Edit User"
                          onClick={() => toast.info("Edit feature coming soon")}
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          style={styles.deleteBtn}
                          title="Remove User"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Confirm Removal</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={styles.modalClose}
              >
                <FiX size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>
                Are you sure you want to remove{" "}
                <strong>{selectedUser.name}</strong> from the system?
              </p>
              <p style={styles.modalWarning}>This action cannot be undone.</p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleDeleteUser} style={styles.confirmBtn}>
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {showActivateModal && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Confirm Activation</h3>
              <button
                onClick={() => setShowActivateModal(false)}
                style={styles.modalClose}
              >
                <FiX size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>
                Are you sure you want to activate{" "}
                <strong>{selectedUser.name}</strong>?
              </p>
              <p>They will be able to access the system again.</p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowActivateModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button onClick={handleActivateUser} style={styles.confirmBtn}>
                Activate User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  // ... keep your existing styles exactly as they were
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
  },
  filters: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchWrapper: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px 10px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  roleFilter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  roleSelect: {
    padding: "10px 8px",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "14px",
    outline: "none",
  },
  tableContainer: {
    overflowX: "auto",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
  },
  roleBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "6px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#4f46e5",
  },
  deleteBtn: {
    padding: "6px",
    backgroundColor: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ef4444",
  },
  loadingCell: {
    padding: "40px",
    textAlign: "center",
  },
  emptyCell: {
    padding: "40px",
    textAlign: "center",
    color: "#9ca3af",
  },
  emptySubtext: {
    fontSize: "12px",
    marginTop: "8px",
    color: "#d1d5db",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 12px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "400px",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  modalBody: {
    padding: "20px",
  },
  modalWarning: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "8px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default AdminUsersPage;
