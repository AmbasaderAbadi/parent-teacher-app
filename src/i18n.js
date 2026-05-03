// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import am from "./locales/am.json";
import ti from "./locales/ti.json";

const resources = {
  en: { translation: en },
  am: { translation: am },
  ti: { translation: ti },
};

// 1. Get saved language from userPreferences
const getSavedLanguage = () => {
  try {
    const prefs = localStorage.getItem("userPreferences");
    if (prefs) {
      const { language } = JSON.parse(prefs);
      if (language && ["en", "am", "ti"].includes(language)) return language;
    }
  } catch (e) {}
  return null;
};

// 2. Fallback to browser language or English
const savedLang = getSavedLanguage();
const browserLang = navigator.language.split("-")[0];
const initialLang =
  savedLang ||
  (browserLang === "am" ? "am" : browserLang === "ti" ? "ti" : "en");

// 3. Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// 4. When language changes, save to userPreferences
i18n.on("languageChanged", (lng) => {
  try {
    const prefs = JSON.parse(localStorage.getItem("userPreferences") || "{}");
    prefs.language = lng;
    localStorage.setItem("userPreferences", JSON.stringify(prefs));
  } catch (e) {}
});

export default i18n;
