import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiSave,
  FiEdit2,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { authAPI, usersAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [parentInfo, setParentInfo] = useState({ name: "", phone: "" });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || userData.phone || "",
          address: userData.address || "",
          dateOfBirth: userData.dateOfBirth || "",
        });
      }

      try {
        const response = await authAPI.getProfile();
        const freshUser = response.data;
        setUser(freshUser);
        setFormData({
          firstName: freshUser.firstName || "",
          lastName: freshUser.lastName || "",
          email: freshUser.email || "",
          phoneNumber: freshUser.phoneNumber || freshUser.phone || "",
          address: freshUser.address || "",
          dateOfBirth: freshUser.dateOfBirth || "",
        });

        // If user is a student, fetch parent info using parentPhoneNumber
        if (
          freshUser.role?.toLowerCase() === "student" &&
          freshUser.parentPhoneNumber
        ) {
          try {
            const parentRes = await usersAPI.getUserByPhone(
              freshUser.parentPhoneNumber,
            );
            const parentData = parentRes.data;
            setParentInfo({
              name:
                `${parentData.firstName || ""} ${parentData.lastName || ""}`.trim() ||
                "Parent",
              phone: parentData.phoneNumber,
            });
          } catch (parentErr) {
            console.warn(
              "Could not fetch parent details (403 likely):",
              parentErr,
            );
            // Fallback: display only the phone number (which we already have)
            setParentInfo({
              name: "Name not available", // Backend needs to allow access or include name in student object
              phone: freshUser.parentPhoneNumber,
            });
          }
        }
      } catch (error) {
        console.log("Using stored user data");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || "",
        address: formData.address,
      };

      console.log("Sending update data:", updateData);

      const response = await authAPI.updateProfile(updateData);
      const updatedUser = response.data;

      const mergedUser = { ...user, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      setUser(mergedUser);

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div style={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 12px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isStudent = user?.role?.toLowerCase() === "student";

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Profile Settings</h1>
          <p style={styles.subtitle}>Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
            <FiEdit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div style={styles.editActions}>
            <button
              onClick={() => setIsEditing(false)}
              style={styles.cancelBtn}
            >
              <FiX size={16} /> Cancel
            </button>
            <button onClick={handleSave} style={styles.saveBtn}>
              <FiSave size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div style={styles.profileCard}>
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {formData.firstName?.charAt(0) || user?.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <h2 style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p style={styles.userRole}>{user?.role}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div style={styles.formGrid}>
          <div style={styles.formField}>
            <label style={styles.label}>First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your first name"
              />
            ) : (
              <p style={styles.value}>{user?.firstName || "Not set"}</p>
            )}
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your last name"
              />
            ) : (
              <p style={styles.value}>{user?.lastName || "Not set"}</p>
            )}
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>
              <FiMail size={14} /> Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter your email"
              />
            ) : (
              <p style={styles.value}>{user?.email || "Not set"}</p>
            )}
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>
              <FiPhone size={14} /> Phone Number
            </label>
            <p style={{ ...styles.value, ...styles.readOnlyValue }}>
              {user?.phoneNumber || user?.phone || "Not set"}
            </p>
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>
              <FiMapPin size={14} /> Address
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Enter your address"
                rows={2}
              />
            ) : (
              <p style={styles.value}>{user?.address || "Not set"}</p>
            )}
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>
              <FiCalendar size={14} /> Date of Birth
            </label>
            <p style={{ ...styles.value, ...styles.readOnlyValue }}>
              {user?.dateOfBirth || "Not set"}
            </p>
          </div>

          {/* Parent/Guardian Fields - ONLY visible for Students */}
          {isStudent && (
            <>
              <div style={styles.formField}>
                <label style={styles.label}>
                  <FiUser size={14} /> Parent/Guardian Name
                </label>
                <p style={{ ...styles.value, ...styles.readOnlyValue }}>
                  {parentInfo.name ||
                    (user?.parentPhoneNumber
                      ? "Name not available"
                      : "Not linked")}
                </p>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>
                  <FiPhone size={14} /> Parent/Guardian Phone
                </label>
                <p style={{ ...styles.value, ...styles.readOnlyValue }}>
                  {parentInfo.phone ||
                    user?.parentPhoneNumber ||
                    "Not available"}
                </p>
              </div>
            </>
          )}
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
          margin-bottom: 12px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "800px",
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
  editBtn: {
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
    transition: "all 0.2s ease",
  },
  editActions: {
    display: "flex",
    gap: "12px",
  },
  cancelBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.2s ease",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  avatarSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    paddingBottom: "24px",
    marginBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  userRole: {
    fontSize: "14px",
    color: "#6b7280",
    textTransform: "capitalize",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  value: {
    fontSize: "15px",
    color: "#1f2937",
    margin: 0,
    padding: "10px 0",
  },
  readOnlyValue: {
    color: "#6b7280",
    fontStyle: "italic",
    backgroundColor: "#f9fafb",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px dashed #e5e7eb",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  textarea: {
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    transition: "all 0.2s ease",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
};
