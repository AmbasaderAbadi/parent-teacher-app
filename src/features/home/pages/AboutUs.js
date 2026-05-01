import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiUserCheck, FiMail, FiCompass } from "react-icons/fi";

const AboutUs = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links (same as homepage)
  const navItems = [
    { to: "/", label: "Home", icon: FiHome },
    { to: "/about", label: "About", icon: FiUserCheck },
    { to: "/contact", label: "Contact", icon: FiMail },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation Bar - Dark, same as homepage */}
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
              ParentTeacher Portal
            </motion.span>
          </motion.div>
          <div style={styles.navLinks}>
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
        </div>
      </nav>

      {/* Background Wrapper (same as homepage) */}
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
                <div style={styles.badge}>🌟 Our Story</div>
                <h1 style={styles.lightTitle}>
                  <span style={styles.gradientText}>About Us</span>
                </h1>
                <p style={styles.lightSubtitle}>
                  Our mission is to foster strong, meaningful communication
                  between parents and teachers.
                </p>
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
                  <h3 style={styles.missionTitle}>Our Mission</h3>
                  <p style={styles.missionText}>
                    To create a collaborative digital space that bridges the gap
                    between home and school, ensuring every child receives the
                    support they need through unified efforts of teachers and
                    parents.
                  </p>
                </div>
                <div style={styles.missionCard}>
                  <div style={styles.missionIcon}>👁️</div>
                  <h3 style={styles.missionTitle}>Our Vision</h3>
                  <p style={styles.missionText}>
                    To be the leading digital bridge between home and school,
                    transforming educational communication and student outcomes
                    worldwide.
                  </p>
                </div>
                <div style={styles.missionCard}>
                  <div style={styles.missionIcon}>💎</div>
                  <h3 style={styles.missionTitle}>Our Values</h3>
                  <p style={styles.missionText}>
                    Transparency, Collaboration, Innovation, and
                    Student-Centered Approach in everything we do.
                  </p>
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
              <h2 style={styles.lightTitle}>Meet Our Team</h2>
              <p style={styles.lightSubtitle}>
                Passionate educators and technologists working together
              </p>
              <div style={styles.teamGrid}>
                <div style={styles.teamCard}>
                  <div style={styles.teamAvatar}>👩‍🏫</div>
                  <h5 style={styles.teamName}>Ambasador Abadi</h5>
                  <p style={styles.teamRole}>Founder & CEO</p>
                  <p style={styles.teamBio}>
                    Former educator with 15+ years of experience
                  </p>
                </div>
                <div style={styles.teamCard}>
                  <div style={styles.teamAvatar}>👨‍💻</div>
                  <h5 style={styles.teamName}>Hayelom Hailay</h5>
                  <p style={styles.teamRole}>Frontend Development</p>
                  <p style={styles.teamBio}>
                    EdTech specialist and full-stack developer
                  </p>
                </div>
                <div style={styles.teamCard}>
                  <div style={styles.teamAvatar}>👩‍🎨</div>
                  <h5 style={styles.teamName}>Tedros Welu</h5>
                  <p style={styles.teamRole}>Backend Developer</p>
                  <p style={styles.teamBio}>
                    Passionate about user experience design
                  </p>
                </div>
                <div style={styles.teamCard}>
                  <div style={styles.teamAvatar}>👨‍🏫</div>
                  <h5 style={styles.teamName}>Chrwel G/hiwet</h5>
                  <p style={styles.teamRole}>Backend Developer</p>
                  <p style={styles.teamBio}>Curriculum development expert</p>
                </div>
                <div style={styles.teamCard}>
                  <div style={styles.teamAvatar}>👨‍🏫</div>
                  <h5 style={styles.teamName}>Biniam Amene</h5>
                  <p style={styles.teamRole}>Education Advisor</p>
                  <p style={styles.teamBio}>Curriculum development expert</p>
                </div>
                <div style={styles.teamCard}>
                  <div style={styles.teamAvatar}>👨‍🏫</div>
                  <h5 style={styles.teamName}>Sirak Kibrom</h5>
                  <p style={styles.teamRole}>Team Coordinator</p>
                  <p style={styles.teamBio}>Curriculum development expert</p>
                </div>
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
              <h2 style={styles.ctaTitle}>Ready to Get Started?</h2>
              <p style={styles.ctaText}>
                Join thousands of parents and teachers already using our
                platform
              </p>
              <Link to="/register">
                <button style={styles.ctaButton}>Sign Up Now →</button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer (same as homepage) */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>ParentTeacher Portal</h4>
            <p style={styles.footerText}>
              Bridging the gap between parents and teachers for better
              education.
            </p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Quick Links</h4>
            <Link to="/" style={styles.footerLink}>
              Home
            </Link>
            <Link to="/about" style={styles.footerLink}>
              About Us
            </Link>
            <Link to="/contact" style={styles.footerLink}>
              Contact Us
            </Link>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Legal</h4>
            <a href="/privacy-policy" style={styles.footerLink}>
              Privacy Policy
            </a>
            <a href="/terms-of-service" style={styles.footerLink}>
              Terms of Service
            </a>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerTitle}>Contact</h4>
            <p style={styles.footerText}>📧 support@parentteacher.com</p>
            <p style={styles.footerText}>📞 +1 (555) 123-4567</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>
            &copy; 2026 Parent-Teacher Relationship Portal. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .mission-card:hover, .team-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .nav-link:hover svg { transform: translateY(-2px); }
        .nav-link:hover { background: rgba(255,255,255,0.1); color: #c084fc; }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .light-title { font-size: 32px !important; }
          .light-subtitle { font-size: 16px !important; }
          .mission-grid, .team-grid { grid-template-columns: 1fr !important; }
          .cta-inner { padding: 40px 20px !important; margin: 0 16px 40px !important; }
          .cta-title { font-size: 24px !important; }
          .footer-content { grid-template-columns: 1fr !important; text-align: center; }
          .footer-section { align-items: center !important; }
          .mission-card, .team-card { padding: 24px !important; }
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
  container: { fontFamily: "'Inter', sans-serif" },

  // Navigation - Dark background
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  navScrolled: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
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
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  },
  logoName: {
    fontSize: "20px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  navLinks: { display: "flex", gap: "28px", alignItems: "center" },
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

  // Background and overlay
  backgroundWrapper: {
    position: "relative",
    backgroundImage: "url('/images/event2.jpg')",
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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

  // Mission Cards
  missionGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  missionCard: {
    padding: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
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

  // Team Cards
  teamGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "32px",
  },
  teamCard: {
    padding: "24px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
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
  teamRole: { fontSize: "14px", color: "#c084fc", marginBottom: "8px" },
  teamBio: { fontSize: "13px", color: "#e0e0e0" },

  // CTA
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

  // Footer
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
