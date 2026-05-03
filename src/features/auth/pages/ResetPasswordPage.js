import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/api";
import "../../../assets/styles/auth-pages.css";

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ensure user came from forgot password page
  useEffect(() => {
    if (!location.state?.phoneNumber) {
      toast.error(t("start_from_forgot"));
      navigate("/forgot-password");
    } else {
      setPhoneNumber(location.state.phoneNumber);
    }
  }, [location, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!code || !newPassword || !confirmPassword) {
      toast.error(t("all_fields_required"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("password_mismatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("password_min_length"));
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token: code.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      toast.success(t("reset_success"));
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || t("reset_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="form-panel">
          <div className="form-header">
            <h2 className="form-title">{t("reset_password")}</h2>
            <p className="form-subtitle">{t("reset_password_instruction")}</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {/* CODE */}
            <div className="input-wrapper">
              <label className="input-label">{t("verification_code")}</label>
              <div className="input-container">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("enter_code")}
                  className="input-field"
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="input-wrapper">
              <label className="input-label">{t("new_password")}</label>
              <div className="input-container">
                <span className="input-icon">
                  <FiLock />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("new_password_placeholder")}
                  className="input-field"
                />

                <span
                  className="input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-wrapper">
              <label className="input-label">{t("confirm_password")}</label>
              <div className="input-container">
                <span className="input-icon">
                  <FiLock />
                </span>

                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirm_password_placeholder")}
                  className="input-field"
                />

                <span
                  className="input-icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ cursor: "pointer" }}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            {/* SUBMIT */}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  {t("reset_password")} <FiArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
