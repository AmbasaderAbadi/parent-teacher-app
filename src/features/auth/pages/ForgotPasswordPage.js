import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/api";
import "../../../assets/styles/auth-pages.css";

export const ForgotPasswordPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(phoneNumber);

      toast.success("Code sent via Telegram!");
      navigate("/reset-password", { state: { phoneNumber } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="form-panel">
          <div className="form-header">
            <h2 className="form-title">Forgot Password</h2>
            <p className="form-subtitle">
              Enter your phone number to receive a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="input-wrapper">
              <label className="input-label">Phone Number</label>

              <div className="input-container">
                <span className="input-icon">
                  <FiPhone />
                </span>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Send Code <FiArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
