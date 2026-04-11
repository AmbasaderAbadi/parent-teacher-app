import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMessageSquare,
  FiBell,
  FiBarChart2,
  FiCheckCircle,
  FiUsers,
  FiStar,
  FiArrowRight,
  FiClock,
  FiAward,
  FiShield,
} from "react-icons/fi";

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({
    activeUsers: 0,
    partnerSchools: 0,
    messagesSent: 0,
    satisfactionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // TODO: Replace with actual API call when backend is ready
    // For now, using mock data that will be replaced later
    const fetchStats = async () => {
      try {
        // Replace this with actual API call
        // const response = await apiService.getStats();
        // setStats(response.data);

        // Mock data - will be replaced when backend is ready
        setTimeout(() => {
          setStats({
            activeUsers: 10234,
            partnerSchools: 523,
            messagesSent: 52341,
            satisfactionRate: 98,
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    fetchStats();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
      <section id="home" style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={styles.badge}>
              ✨ The Future of Education Communication
            </div>
            <h1 style={styles.heroTitle}>
              Bridging the Gap Between{" "}
              <span style={styles.gradientText}>Parents & Teachers</span>
            </h1>
            <p style={styles.heroSubtitle}>
              A powerful platform that connects parents and teachers in
              real-time, enabling seamless communication, progress tracking, and
              collaborative learning for student success.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/register">
                <button style={styles.primaryBtn}>
                  Get Started <FiArrowRight style={{ marginLeft: "8px" }} />
                </button>
              </Link>
              <Link to="/login">
                <button style={styles.secondaryBtn}>Sign In</button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div style={styles.trustBadges}>
              <div style={styles.trustItem}>
                <FiUsers size={20} />
                <span>
                  {loading
                    ? "Loading..."
                    : `${formatNumber(stats.activeUsers)}+ Users`}
                </span>
              </div>
              <div style={styles.trustItem}>
                <FiStar size={20} />
                <span>4.9/5 Rating</span>
              </div>
              <div style={styles.trustItem}>
                <FiCheckCircle size={20} />
                <span>
                  {loading
                    ? "Loading..."
                    : `${formatNumber(stats.partnerSchools)}+ Schools`}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={styles.sectionTitle}>
            Everything You Need in{" "}
            <span style={styles.gradientText}>One Platform</span>
          </h2>
          <p style={styles.sectionSubtitle}>
            Powerful features designed to enhance communication and improve
            student outcomes
          </p>

          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <FiMessageSquare size={28} />
              </div>
              <h3 style={styles.featureTitle}>Real-Time Communication</h3>
              <p style={styles.featureDesc}>
                Instant messaging between parents and teachers. Get real-time
                updates about your child's progress, assignments, and school
                activities.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Direct messaging</li>
                <li>✓ Group conversations</li>
                <li>✓ File sharing</li>
              </ul>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <FiBarChart2 size={28} />
              </div>
              <h3 style={styles.featureTitle}>Progress Tracking</h3>
              <p style={styles.featureDesc}>
                Monitor academic performance with detailed grade reports and
                analytics. Track improvement over time and identify areas
                needing attention.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Grade history</li>
                <li>✓ Performance analytics</li>
                <li>✓ Subject-wise breakdown</li>
              </ul>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <FiBell size={28} />
              </div>
              <h3 style={styles.featureTitle}>Smart Notifications</h3>
              <p style={styles.featureDesc}>
                Never miss important updates with real-time notifications about
                grades, attendance, events, and parent-teacher meetings.
              </p>
              <ul style={styles.featureList}>
                <li>✓ Grade alerts</li>
                <li>✓ Attendance updates</li>
                <li>✓ Event reminders</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Dynamic data from backend */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {loading ? (
                <span style={styles.statLoader}>---</span>
              ) : (
                `${formatNumber(stats.activeUsers)}+`
              )}
            </div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {loading ? (
                <span style={styles.statLoader}>---</span>
              ) : (
                `${formatNumber(stats.partnerSchools)}+`
              )}
            </div>
            <div style={styles.statLabel}>Partner Schools</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {loading ? (
                <span style={styles.statLoader}>---</span>
              ) : (
                `${formatNumber(stats.messagesSent)}+`
              )}
            </div>
            <div style={styles.statLabel}>Messages Sent</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {loading ? (
                <span style={styles.statLoader}>---</span>
              ) : (
                `${stats.satisfactionRate}%`
              )}
            </div>
            <div style={styles.statLabel}>Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.section}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSubtitle}>Simple steps to get started</p>

          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>01</div>
              <h3 style={styles.stepTitle}>Create Account</h3>
              <p style={styles.stepDesc}>
                Sign up as a parent or teacher with your details
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>02</div>
              <h3 style={styles.stepTitle}>Connect</h3>
              <p style={styles.stepDesc}>
                Link with your child's school or class
              </p>
            </div>
            <div style={styles.stepCard}>
              <div style={styles.stepNumber}>03</div>
              <h3 style={styles.stepTitle}>Start Collaborating</h3>
              <p style={styles.stepDesc}>
                Access grades, attendance, and start messaging
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonialsSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={styles.sectionTitle}>What Our Community Says</h2>
          <p style={styles.sectionSubtitle}>
            Trusted by thousands of parents and teachers
          </p>

          <div style={styles.testimonialsGrid}>
            <div style={styles.testimonialCard}>
              <div style={styles.testimonialQuote}>"</div>
              <p style={styles.testimonialText}>
                This platform has transformed how I communicate with my child's
                teachers. I never miss an update and can track progress in
                real-time.
              </p>
              <div style={styles.testimonialAuthor}>
                <strong>Sarah Johnson</strong>
                <span>Parent</span>
              </div>
              <div style={styles.rating}>★★★★★</div>
            </div>

            <div style={styles.testimonialCard}>
              <div style={styles.testimonialQuote}>"</div>
              <p style={styles.testimonialText}>
                The best tool for managing parent communication. Saves me hours
                every week and keeps parents engaged in their child's education.
              </p>
              <div style={styles.testimonialAuthor}>
                <strong>Michael Chen</strong>
                <span>Teacher</span>
              </div>
              <div style={styles.rating}>★★★★★</div>
            </div>

            <div style={styles.testimonialCard}>
              <div style={styles.testimonialQuote}>"</div>
              <p style={styles.testimonialText}>
                Incredible platform that has improved parent engagement
                significantly. A game-changer for our school community.
              </p>
              <div style={styles.testimonialAuthor}>
                <strong>Emily Rodriguez</strong>
                <span>Principal</span>
              </div>
              <div style={styles.rating}>★★★★★</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        style={styles.callToAction}
      >
        <h2 style={styles.ctaTitle}>Ready to Transform Communication?</h2>
        <p style={styles.ctaText}>
          Join thousands of parents and teachers already using our platform
        </p>
        <Link to="/register">
          <button style={styles.ctaButton}>
            Get Started Free <FiArrowRight style={{ marginLeft: "8px" }} />
          </button>
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
            <p style={styles.footerText}>📞 +251 962690648</p>
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
    padding: "140px 24px 80px",
    background: "linear-gradient(135deg, #667eea08 0%, #764ba208 100%)",
  },
  heroContent: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "24px",
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
  heroButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginBottom: "40px",
  },
  primaryBtn: {
    padding: "12px 32px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
  },
  secondaryBtn: {
    padding: "12px 32px",
    backgroundColor: "white",
    color: "#667eea",
    border: "2px solid #667eea",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  trustBadges: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    flexWrap: "wrap",
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6b7280",
    fontSize: "14px",
  },
  section: {
    padding: "80px 24px",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "16px",
    color: "#1a1a2e",
  },
  sectionSubtitle: {
    fontSize: "18px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "48px",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  featureCard: {
    padding: "32px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  featureIconWrapper: {
    width: "56px",
    height: "56px",
    backgroundColor: "#eef2ff",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4f46e5",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#1a1a2e",
  },
  featureDesc: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  statsSection: {
    padding: "60px 24px",
    backgroundColor: "#f8fafc",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
    textAlign: "center",
  },
  statCard: {
    padding: "24px",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: "8px",
  },
  statLoader: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#cbd5e1",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  stepCard: {
    textAlign: "center",
    padding: "32px",
  },
  stepNumber: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#e0e7ff",
    marginBottom: "16px",
  },
  stepTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#1a1a2e",
  },
  stepDesc: {
    fontSize: "14px",
    color: "#6b7280",
  },
  testimonialsSection: {
    padding: "80px 24px",
    backgroundColor: "#ffffff",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  testimonialCard: {
    padding: "32px",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    position: "relative",
  },
  testimonialQuote: {
    fontSize: "48px",
    color: "#c7d2fe",
    position: "absolute",
    top: "16px",
    left: "24px",
  },
  testimonialText: {
    fontSize: "15px",
    color: "#4a5568",
    lineHeight: "1.6",
    marginBottom: "20px",
    fontStyle: "italic",
  },
  testimonialAuthor: {
    marginBottom: "8px",
  },
  rating: {
    fontSize: "14px",
    color: "#fbbf24",
  },
  callToAction: {
    margin: "40px 24px 80px",
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
    color: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    transition: "all 0.3s ease",
  },
  footer: {
    backgroundColor: "#1a1a2e",
    color: "white",
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
  .feature-card:hover, .testimonial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  a:hover {
    color: #667eea !important;
  }
`;
document.head.appendChild(styleSheet);

export default HomePage;
