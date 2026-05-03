import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <button
        onClick={() => changeLanguage("en")}
        disabled={current === "en"}
        style={{
          padding: "4px 8px",
          background: current === "en" ? "#4f46e5" : "#e5e7eb",
          color: current === "en" ? "white" : "#374151",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("am")}
        disabled={current === "am"}
        style={{
          padding: "4px 8px",
          background: current === "am" ? "#4f46e5" : "#e5e7eb",
          color: current === "am" ? "white" : "#374151",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        አማ
      </button>
      <button
        onClick={() => changeLanguage("ti")}
        disabled={current === "ti"}
        style={{
          padding: "4px 8px",
          background: current === "ti" ? "#4f46e5" : "#e5e7eb",
          color: current === "ti" ? "white" : "#374151",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ትግ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
