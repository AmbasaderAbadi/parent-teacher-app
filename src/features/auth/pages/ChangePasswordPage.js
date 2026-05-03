import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { authAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const current = formData.currentPassword.trim();
    const newPwd = formData.newPassword.trim();
    const confirm = formData.confirmPassword.trim();

    if (!current) newErrors.currentPassword = t("current_password_required");
    if (!newPwd) newErrors.newPassword = t("new_password_required");
    else if (newPwd.length < 6)
      newErrors.newPassword = t("password_min_length");
    if (!confirm) newErrors.confirmPassword = t("confirm_password_required");
    else if (newPwd !== confirm)
      newErrors.confirmPassword = t("password_mismatch");
    if (current && newPwd && current === newPwd) {
      newErrors.newPassword = t("password_must_differ");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentPassword = formData.currentPassword.trim();
    const newPassword = formData.newPassword.trim();
    const confirmNewPassword = formData.confirmPassword.trim();

    const payload = {
      currentPassword,
      newPassword,
      confirmNewPassword,
    };

    setLoading(true);
    try {
      await authAPI.changePassword(payload);
      toast.success(t("password_changed_success"));
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        t("password_change_failed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    const levels = [t("weak"), t("fair"), t("good"), t("strong")];
    const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
    return {
      text: levels[strength - 1] || t("very_weak"),
      color: colors[strength - 1] || "#ef4444",
      strength,
    };
  };

  const passwordStrength = formData.newPassword
    ? getPasswordStrength(formData.newPassword)
    : null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t("change_password")}</h1>
          <p style={styles.subtitle}>{t("change_password_desc")}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiLock size={14} /> {t("current_password")}
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder={t("current_password_placeholder")}
                autoComplete="current-password"
                style={{
                  ...styles.input,
                  ...(errors.currentPassword ? styles.inputError : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeBtn}
              >
                {showCurrentPassword ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p style={styles.errorText}>
                <FiAlertCircle size={12} /> {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiLock size={14} /> {t("new_password")}
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={t("new_password_placeholder")}
                autoComplete="new-password"
                style={{
                  ...styles.input,
                  ...(errors.newPassword ? styles.inputError : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeBtn}
              >
                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p style={styles.errorText}>
                <FiAlertCircle size={12} /> {errors.newPassword}
              </p>
            )}
            {formData.newPassword && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBar}>
                  <div
                    style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength.strength / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <p
                  style={{
                    ...styles.strengthText,
                    color: passwordStrength.color,
                  }}
                >
                  {t("password_strength")}: {passwordStrength.text}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiLock size={14} /> {t("confirm_new_password")}
            </label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t("confirm_password_placeholder")}
                autoComplete="off"
                style={{
                  ...styles.input,
                  ...(errors.confirmPassword ? styles.inputError : {}),
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={18} />
                ) : (
                  <FiEye size={18} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={styles.errorText}>
                <FiAlertCircle size={12} /> {errors.confirmPassword}
              </p>
            )}
            {formData.newPassword &&
              formData.confirmPassword &&
              formData.newPassword.trim() ===
                formData.confirmPassword.trim() && (
                <p style={styles.successText}>
                  <FiCheckCircle size={12} /> {t("passwords_match")}
                </p>
              )}
          </div>

          {/* Password Requirements */}
          <div style={styles.requirements}>
            <p style={styles.requirementsTitle}>
              {t("password_requirements")}:
            </p>
            <ul style={styles.requirementsList}>
              <li
                style={
                  formData.newPassword.length >= 6 ? styles.requirementMet : {}
                }
              >
                ✓ {t("req_min_chars")}
              </li>
              <li
                style={
                  /[A-Z]/.test(formData.newPassword)
                    ? styles.requirementMet
                    : {}
                }
              >
                ✓ {t("req_uppercase")}
              </li>
              <li
                style={
                  /[0-9]/.test(formData.newPassword)
                    ? styles.requirementMet
                    : {}
                }
              >
                ✓ {t("req_number")}
              </li>
              <li
                style={
                  /[^A-Za-z0-9]/.test(formData.newPassword)
                    ? styles.requirementMet
                    : {}
                }
              >
                ✓ {t("req_special")}
              </li>
            </ul>
          </div>

          <div style={styles.formActions}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
            >
              {loading ? (
                <span className="loading-spinner-small"></span>
              ) : (
                <>
                  <FiSave size={16} /> {t("change_password")}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
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
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
  },
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  subtitle: { fontSize: "14px", color: "#6b7280" },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  formGroup: { marginBottom: "24px" },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  },
  inputWrapper: { position: "relative" },
  input: {
    width: "100%",
    padding: "12px 40px 12px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },
  inputError: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  errorText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "6px",
  },
  successText: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#10b981",
    marginTop: "6px",
  },
  strengthContainer: { marginTop: "8px" },
  strengthBar: {
    height: "4px",
    backgroundColor: "#e5e7eb",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "6px",
  },
  strengthFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  strengthText: { fontSize: "11px", margin: 0 },
  requirements: {
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  requirementsTitle: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: "8px",
  },
  requirementsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  requirementMet: { color: "#10b981", textDecoration: "line-through" },
  formActions: { marginTop: "32px" },
  submitBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  submitBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
};

export default ChangePasswordPage;
