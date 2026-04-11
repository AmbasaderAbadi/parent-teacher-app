import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AboutUs = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav
        style={{
          ...styles.nav,
          ...(scrolled ? styles.navScrolled : {}),
        }}
      >
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoText}>PT</span>
            <span style={styles.logoName}>ParentTeacher Portal</span>
          </div>
          <div style={styles.navLinks}>
            <Link to="/" style={styles.navLink}>
              Home
            </Link>
            <Link to="/about" style={styles.navLink}>
              About Us
            </Link>
            <Link to="/contact" style={styles.navLink}>
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={styles.heroTitle}>
              <span style={styles.gradientText}>About Us</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Our mission is to foster strong, meaningful communication between
              parents and teachers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={styles.section}
      >
        <div style={styles.missionGrid}>
          <div style={styles.missionCard}>
            <div style={styles.missionIcon}>🎯</div>
            <h3 style={styles.missionTitle}>Our Mission</h3>
            <p style={styles.missionText}>
              To create a collaborative digital space that bridges the gap
              between home and school, ensuring every child receives the support
              they need through unified efforts of teachers and parents.
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
              Transparency, Collaboration, Innovation, and Student-Centered
              Approach in everything we do.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={styles.statsSection}
      >
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>10,000+</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>500+</div>
            <div style={styles.statLabel}>Partner Schools</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>50,000+</div>
            <div style={styles.statLabel}>Messages Sent</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>98%</div>
            <div style={styles.statLabel}>Satisfaction Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Team Section */}
      <section style={styles.section}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h4 style={styles.sectionTitle}>Our Team</h4>
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
              <p style={styles.teamRole}>frontend development</p>
              <p style={styles.teamBio}>
                EdTech specialist and full-stack developer
              </p>
            </div>
            <div style={styles.teamCard}>
              <div style={styles.teamAvatar}>👩‍🎨</div>
              <h5 style={styles.teamName}>Tedros Welu</h5>
              <p style={styles.teamRole}>backend developer</p>
              <p style={styles.teamBio}>
                Passionate about user experience design
              </p>
            </div>
            <div style={styles.teamCard}>
              <div style={styles.teamAvatar}>👨‍🏫</div>
              <h5 style={styles.teamName}>Chrwel G/hiwet</h5>
              <p style={styles.teamRole}>backend developer</p>
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
              <p style={styles.teamRole}>team coordinator</p>
              <p style={styles.teamBio}>Curriculum development expert</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={styles.callToAction}
      >
        <h4 style={styles.ctaTitle}>Ready to Get Started?</h4>
        <p style={styles.ctaText}>
          Join thousands of parents and teachers already using our platform
        </p>
        <Link to="/register">
          <button style={styles.ctaButton}>Sign Up Now →</button>
        </Link>
      </motion.div>

      {/* Footer */}
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
            &copy; 2025 Parent-Teacher Relationship Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#ffffff",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  navScrolled: {
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    backgroundColor: "#ffffff",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  logoName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
  },
  navLinks: {
    display: "flex",
    gap: "32px",
  },
  navLink: {
    textDecoration: "none",
    color: "#4a5568",
    fontWeight: "500",
    transition: "color 0.3s ease",
    cursor: "pointer",
  },
  hero: {
    padding: "120px 24px 80px",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: "1.2",
    marginBottom: "20px",
    color: "#1a1a2e",
  },
  gradientText: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#4a5568",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  section: {
    padding: "60px 24px",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "48px",
    color: "#1a1a2e",
  },
  missionGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  missionCard: {
    textAlign: "center",
    padding: "32px",
    backgroundColor: "#f8f9fa",
    borderRadius: "16px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  missionIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  missionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#1a1a2e",
  },
  missionText: {
    fontSize: "16px",
    color: "#6c757d",
    lineHeight: "1.6",
  },
  statsSection: {
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "0 24px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
  },
  statCard: {
    textAlign: "center",
    padding: "32px",
    backgroundColor: "#f8f9fa",
    borderRadius: "16px",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#667eea",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6c757d",
  },
  teamGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "32px",
  },
  teamCard: {
    textAlign: "center",
    padding: "24px",
    backgroundColor: "#f8f9fa",
    borderRadius: "16px",
    transition: "transform 0.3s ease",
  },
  teamAvatar: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  teamName: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#1a1a2e",
  },
  teamRole: {
    fontSize: "14px",
    color: "#667eea",
    marginBottom: "8px",
  },
  teamBio: {
    fontSize: "13px",
    color: "#6c757d",
  },
  callToAction: {
    margin: "60px 24px",
    padding: "60px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    textAlign: "center",
    color: "white",
  },
  ctaTitle: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "16px",
  },
  ctaText: {
    fontSize: "18px",
    marginBottom: "32px",
    opacity: 0.95,
  },
  ctaButton: {
    padding: "14px 36px",
    backgroundColor: "white",
    color: "#667eea",
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
    marginTop: "60px",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "40px",
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  footerText: {
    fontSize: "14px",
    color: "#a0aec0",
    lineHeight: "1.5",
  },
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

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .mission-card:hover, .team-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  a:hover {
    color: #667eea !important;
  }
`;
document.head.appendChild(styleSheet);

export default AboutUs;
