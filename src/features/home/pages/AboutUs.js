import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUserCheck,
  FiMail,
  FiCompass,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { to: "/", label: t("home"), icon: FiHome },
    { to: "/about", label: t("about"), icon: FiUserCheck },
    { to: "/contact", label: t("contact"), icon: FiMail },
  ];

  // Team data – now using translation keys
  const teamMembers = [
    {
      nameKey: "team_member_ambasador",
      roleKey: "team_role_frontend_dev",
      bioKey: "team_bio_ambasador",
      icon: "👨‍💻",
    },
    {
      nameKey: "team_member_hayelom",
      roleKey: "team_role_frontend_dev",
      bioKey: "team_bio_hayelom",
      icon: "👨‍💻",
    },
    {
      nameKey: "team_member_tedros",
      roleKey: "team_role_backend_lead",
      bioKey: "team_bio_tedros",
      icon: "👨‍🔧",
    },
    {
      nameKey: "team_member_chrwel",
      roleKey: "team_role_backend_lead",
      bioKey: "team_bio_chrwel",
      icon: "👨‍🔧",
    },
    {
      nameKey: "team_member_biniam",
      roleKey: "team_role_coordinator",
      bioKey: "team_bio_biniam",
      icon: "👨‍🏫",
    },
    {
      nameKey: "team_member_sirak",
      roleKey: "team_role_ux",
      bioKey: "team_bio_sirak",
      icon: "👨‍🏫",
    },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.navContent}>
          <motion.div
            style={styles.logo}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div style={styles.logoIcon}>
              <FiCompass size={28} color="#ffffff" />
            </div>
            <motion.span
              style={styles.logoName}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {t("app_name")}
            </motion.span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={styles.desktopNav}>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={item.to} style={styles.navLink}>
                    <Icon size={18} style={styles.navIcon} />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(true)}
            style={styles.hamburger}
          >
            <FiMenu size={24} color="#fff" />
          </button>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          <div
            style={styles.mobileBackdrop}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div style={styles.mobileMenu}>
            <div style={styles.mobileMenuHeader}>
              <span style={styles.mobileMenuTitle}>Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={styles.mobileMenuClose}
              >
                <FiX size={24} />
              </button>
            </div>
            <div style={styles.mobileMenuLinks}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    style={styles.mobileNavLink}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div style={styles.backgroundWrapper}>
        <div style={styles.globalOverlay}></div>
        <div style={styles.contentWrapper}>
          {/* Hero Section */}
          <div style={styles.section}>
            <div style={styles.heroContent}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div style={styles.badge}>🌟 {t("about_badge")}</div>
                <h1 style={styles.lightTitle}>
                  <span style={styles.gradientText}>{t("about_title")}</span>
                </h1>
                <p style={styles.lightSubtitle}>{t("about_hero_text")}</p>
              </motion.div>
            </div>
          </div>

          {/* Mission, Vision, Values */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div style={styles.missionGrid}>
                <div style={styles.missionCard}>
                  <div style={styles.missionIcon}>🎯</div>
                  <h3 style={styles.missionTitle}>{t("mission_title")}</h3>
                  <p style={styles.missionText}>{t("mission_text")}</p>
                </div>
                <div style={styles.missionCard}>
                  <div style={styles.missionIcon}>👁️</div>
                  <h3 style={styles.missionTitle}>{t("vision_title")}</h3>
                  <p style={styles.missionText}>{t("vision_text")}</p>
                </div>
                <div style={styles.missionCard}>
                  <div style={styles.missionIcon}>💎</div>
                  <h3 style={styles.missionTitle}>{t("values_title")}</h3>
                  <p style={styles.missionText}>{t("values_text")}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Team Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 style={styles.lightTitle}>{t("team_title")}</h2>
              <p style={styles.lightSubtitle}>{t("team_subtitle")}</p>
              <div style={styles.teamGrid}>
                {teamMembers.map((member, idx) => (
                  <div key={idx} style={styles.teamCard}>
                    <div style={styles.teamAvatar}>{member.icon}</div>
                    <h5 style={styles.teamName}>{t(member.nameKey)}</h5>
                    <p style={styles.teamRole}>{t(member.roleKey)}</p>
                    <p style={styles.teamBio}>{t(member.bioKey)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              style={styles.ctaInner}
            >
              <h2 style={styles.ctaTitle}>{t("cta_title")}</h2>
              <p style={styles.ctaText}>{t("cta_text")}</p>
              <Link to="/register">
                <button style={styles.ctaButton}>{t("cta_button")}</button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>{t("app_name")}</h4>
            <p style={styles.footerText}>{t("footer_desc")}</p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>{t("quick_links")}</h4>
            <Link to="/" style={styles.footerLink}>
              {t("home")}
            </Link>
            <Link to="/about" style={styles.footerLink}>
              {t("about_us")}
            </Link>
            <Link to="/contact" style={styles.footerLink}>
              {t("contact_us")}
            </Link>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>{t("legal")}</h4>
            <a href="/privacy-policy" style={styles.footerLink}>
              {t("privacy_policy")}
            </a>
            <a href="/terms-of-service" style={styles.footerLink}>
              {t("terms_of_service")}
            </a>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>{t("contact")}</h4>
            <p style={styles.footerText}>📧 support@parentteacher.com</p>
            <p style={styles.footerText}>📞 +251 962690648</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>{t("copyright")}</p>
        </div>
      </footer>

      <style>{`
        button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .mission-card:hover, .team-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .nav-link:hover svg { transform: translateY(-2px); }
        .nav-link:hover { background: rgba(255,255,255,0.1); color: #c084fc; }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .hamburger { display: flex !important; }
          .light-title { font-size: 32px !important; }
          .light-subtitle { font-size: 16px !important; }
          .mission-grid, .team-grid { grid-template-columns: 1fr !important; }
          .cta-inner { padding: 40px 20px !important; margin: 0 16px 40px !important; }
          .cta-title { font-size: 24px !important; }
        }
        @media (min-width: 769px) {
          .hamburger { display: none !important; }
        }
        @media (max-width: 480px) {
          .light-title { font-size: 28px !important; }
          .team-avatar { font-size: 36px !important; }
          .team-name { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  // All styles remain identical to your existing AboutUs styles – omitted for brevity
  // (keep your existing styles object exactly as it was)
  container: { fontFamily: "'Inter', sans-serif" },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  navScrolled: {
    backgroundColor: "rgba(0,0,0,0.9)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(102,126,234,0.3)",
  },
  logoName: {
    fontSize: "20px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  desktopNav: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    color: "#f0f0f0",
    fontWeight: "500",
    fontSize: "15px",
    padding: "8px 14px",
    borderRadius: "30px",
    transition: "all 0.2s ease",
  },
  navIcon: { transition: "transform 0.2s ease" },
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 2000,
  },
  mobileMenu: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "280px",
    height: "100%",
    backgroundColor: "#1a1a2e",
    zIndex: 2001,
    padding: "20px",
    boxShadow: "2px 0 20px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
  },
  mobileMenuHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  mobileMenuTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#fff",
  },
  mobileMenuClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#fff",
  },
  mobileMenuLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  mobileNavLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    color: "#f0f0f0",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  backgroundWrapper: {
    position: "relative",
    backgroundImage: "url('/images/us1.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    backgroundRepeat: "no-repeat",
  },
  globalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 1,
  },
  contentWrapper: { position: "relative", zIndex: 2 },
  section: { padding: "80px 24px" },
  heroContent: { maxWidth: "800px", margin: "0 auto", textAlign: "center" },
  badge: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "rgba(79,70,229,0.9)",
    color: "#fff",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "24px",
  },
  lightTitle: {
    fontSize: "48px",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: "16px",
    color: "#ffffff",
  },
  lightSubtitle: {
    fontSize: "18px",
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: "48px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  gradientText: {
    background: "linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  missionGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  missionCard: {
    padding: "32px",
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    textAlign: "center",
  },
  missionIcon: { fontSize: "48px", marginBottom: "16px" },
  missionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#ffffff",
  },
  missionText: { fontSize: "16px", color: "#e0e0e0", lineHeight: "1.6" },
  teamGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
  },
  teamCard: {
    padding: "24px",
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    textAlign: "center",
  },
  teamAvatar: { fontSize: "48px", marginBottom: "16px" },
  teamName: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#ffffff",
  },
  teamRole: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#c084fc",
    marginBottom: "12px",
  },
  teamBio: {
    fontSize: "13px",
    color: "#e0e0e0",
    lineHeight: "1.5",
    marginTop: "8px",
  },
  ctaInner: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
    padding: "60px",
    backgroundColor: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(10px)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  ctaTitle: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#ffffff",
  },
  ctaText: { fontSize: "18px", marginBottom: "32px", color: "#e0e0e0" },
  ctaButton: {
    padding: "14px 36px",
    backgroundColor: "white",
    color: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  footer: {
    backgroundColor: "#1a1a2e",
    color: "white",
    position: "relative",
    zIndex: 10,
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "40px",
  },
  footerSection: { display: "flex", flexDirection: "column", gap: "12px" },
  footerTitle: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" },
  footerText: { fontSize: "14px", color: "#a0aec0", lineHeight: "1.5" },
  footerLink: {
    fontSize: "14px",
    color: "#a0aec0",
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  footerBottom: {
    textAlign: "center",
    padding: "24px",
    borderTop: "1px solid #2d3748",
    fontSize: "14px",
    color: "#a0aec0",
  },
};

export default AboutUs;
