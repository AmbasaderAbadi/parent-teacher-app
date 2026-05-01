import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/api";
import "../../../assets/styles/auth-pages.css";

export const ResetPasswordPage = () => {
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
      toast.error("Start from forgot password");
      navigate("/forgot-password");
    } else {
      setPhoneNumber(location.state.phoneNumber);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!code || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token: code.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="form-panel">
          <div className="form-header">
            <h2 className="form-title">Reset Password</h2>
            <p className="form-subtitle">
              Enter verification code and new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {/* CODE */}
            <div className="input-wrapper">
              <label className="input-label">Verification Code</label>
              <div className="input-container">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  className="input-field"
                />
              </div>
            </div>

            {/* NEW PASSWORD */}
            <div className="input-wrapper">
              <label className="input-label">New Password</label>
              <div className="input-container">
                <span
                  className="input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  <FiLock />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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
              <label className="input-label">Confirm Password</label>
              <div className="input-container">
                <span className="input-icon">
                  <FiLock />
                </span>

                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
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
                  Reset Password <FiArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
