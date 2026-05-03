import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/api";
import "../../../assets/styles/auth-pages.css";

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      toast.error(t("phone_number_required"));
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(phoneNumber);
      toast.success(t("code_sent_success"));
      navigate("/reset-password", { state: { phoneNumber } });
    } catch (error) {
      toast.error(error.response?.data?.message || t("code_send_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="form-panel">
          <div className="form-header">
            <h2 className="form-title">{t("forgot_password")}</h2>
            <p className="form-subtitle">{t("forgot_password_instruction")}</p>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="input-wrapper">
              <label className="input-label">{t("phone_number")}</label>

              <div className="input-container">
                <span className="input-icon">
                  <FiPhone />
                </span>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("phone_number_placeholder")}
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  {t("send_code")} <FiArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
