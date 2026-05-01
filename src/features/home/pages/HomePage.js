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
  FiHome,
  FiUserCheck,
  FiMail,
  FiCompass,
} from "react-icons/fi";
import { adminAPI } from "../../../services/api";

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
    fetchStats();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchStats = async () => {
    try {
      const usersResponse = await adminAPI.getAllUsers();
      const usersData = usersResponse.data?.data || usersResponse.data || [];
      const usersList = Array.isArray(usersData) ? usersData : [];
      const totalUsers = usersList.length;

      let totalMessages = 0;
      let partnerSchools = 0;
      let satisfactionRate = 0;

      try {
        const statsResponse = await adminAPI.getStats();
        const statsData = statsResponse.data?.data || statsResponse.data || {};
        totalMessages = statsData.totalMessages ?? 0;
        partnerSchools = statsData.totalSchools ?? 0;
        satisfactionRate = statsData.satisfactionRate ?? 0;
      } catch (e) {
        console.warn("Could not fetch additional stats", e);
      }

      setStats({
        activeUsers: totalUsers,
        partnerSchools: partnerSchools,
        messagesSent: totalMessages,
        satisfactionRate: satisfactionRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        activeUsers: 0,
        partnerSchools: 0,
        messagesSent: 0,
        satisfactionRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Navigation links
  const navItems = [
    { to: "/", label: "Home", icon: FiHome },
    { to: "/about", label: "About", icon: FiUserCheck },
    { to: "/contact", label: "Contact", icon: FiMail },
  ];

  return (
    <div style={styles.container}>
      {/* Navigation Bar - Dark background */}
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.navContent}>
          <motion.div
            style={styles.logo}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div style={styles.logoIcon}>
              <svg
                width="52"
                height="52"
                viewBox="0 0 680 480"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="bgMain"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                  <linearGradient
                    id="bgCircle"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#1a1040" />
                    <stop offset="50%" stopColor="#2d1b69" />
                    <stop offset="100%" stopColor="#1a1040" />
                  </linearGradient>
                  <linearGradient
                    id="leftP"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#667eea" />
                  </linearGradient>
                  <linearGradient
                    id="rightP"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <linearGradient
                    id="bubbleLeft"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient
                    id="bubbleRight"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient
                    id="centerDot"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e0d7ff" />
                  </linearGradient>
                </defs>
                {/* Outer ring */}
                <circle
                  cx="340"
                  cy="240"
                  r="208"
                  fill="url(#bgMain)"
                  opacity="0.9"
                />
                {/* Inner background */}
                <circle cx="340" cy="240" r="200" fill="url(#bgCircle)" />
                {/* Soft rings */}
                <circle
                  cx="340"
                  cy="240"
                  r="170"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  opacity="0.06"
                />
                <circle
                  cx="340"
                  cy="240"
                  r="140"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  opacity="0.04"
                />
                {/* Left glow */}
                <circle
                  cx="210"
                  cy="210"
                  r="58"
                  fill="#667eea"
                  opacity="0.12"
                />
                {/* Left head */}
                <circle cx="210" cy="195" r="36" fill="url(#leftP)" />
                <circle cx="175" cy="198" r="9" fill="url(#leftP)" />
                <circle cx="245" cy="198" r="9" fill="url(#leftP)" />
                <ellipse
                  cx="200"
                  cy="185"
                  rx="10"
                  ry="7"
                  fill="white"
                  opacity="0.18"
                />
                {/* Left neck + body */}
                <rect
                  x="200"
                  y="228"
                  width="20"
                  height="16"
                  rx="4"
                  fill="url(#leftP)"
                />
                <path
                  d="M155 370 Q155 305 210 290 Q265 305 265 370 Z"
                  fill="url(#leftP)"
                />
                <path
                  d="M200 290 L210 308 L220 290"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  opacity="0.4"
                />
                {/* Child */}
                <circle
                  cx="155"
                  cy="255"
                  r="16"
                  fill="url(#leftP)"
                  opacity="0.7"
                />
                <path
                  d="M136 310 Q155 292 174 310 Z"
                  fill="url(#leftP)"
                  opacity="0.7"
                />
                <path
                  d="M172 282 Q185 270 195 278"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                {/* Right glow */}
                <circle
                  cx="470"
                  cy="210"
                  r="58"
                  fill="#9333ea"
                  opacity="0.12"
                />
                {/* Right head */}
                <circle cx="470" cy="195" r="36" fill="url(#rightP)" />
                <circle cx="435" cy="198" r="9" fill="url(#rightP)" />
                <circle cx="505" cy="198" r="9" fill="url(#rightP)" />
                <ellipse
                  cx="460"
                  cy="185"
                  rx="10"
                  ry="7"
                  fill="white"
                  opacity="0.18"
                />
                {/* Right neck + body */}
                <rect
                  x="460"
                  y="228"
                  width="20"
                  height="16"
                  rx="4"
                  fill="url(#rightP)"
                />
                <path
                  d="M415 370 Q415 305 470 290 Q525 305 525 370 Z"
                  fill="url(#rightP)"
                />
                <path
                  d="M460 290 L470 308 L480 290"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  opacity="0.4"
                />
                {/* Graduation cap */}
                <rect
                  x="447"
                  y="163"
                  width="46"
                  height="7"
                  rx="2"
                  fill="white"
                  opacity="0.95"
                />
                <polygon
                  points="470,148 496,163 444,163"
                  fill="white"
                  opacity="0.95"
                />
                <line
                  x1="496"
                  y1="163"
                  x2="501"
                  y2="178"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <circle cx="501" cy="182" r="4" fill="white" opacity="0.9" />
                {/* Left bubble */}
                <rect
                  x="262"
                  y="168"
                  width="72"
                  height="52"
                  rx="14"
                  fill="url(#bubbleLeft)"
                />
                <polygon
                  points="272,220 260,238 290,220"
                  fill="url(#bubbleLeft)"
                />
                <circle cx="282" cy="194" r="5.5" fill="white" opacity="0.95" />
                <circle cx="298" cy="194" r="5.5" fill="white" opacity="0.95" />
                <circle cx="314" cy="194" r="5.5" fill="white" opacity="0.95" />
                {/* Right bubble */}
                <rect
                  x="346"
                  y="168"
                  width="72"
                  height="52"
                  rx="14"
                  fill="url(#bubbleRight)"
                />
                <polygon
                  points="408,220 420,238 390,220"
                  fill="url(#bubbleRight)"
                />
                <circle cx="366" cy="194" r="5.5" fill="white" opacity="0.95" />
                <circle cx="382" cy="194" r="5.5" fill="white" opacity="0.95" />
                <circle cx="398" cy="194" r="5.5" fill="white" opacity="0.95" />
                {/* Center dot */}
                <circle
                  cx="340"
                  cy="194"
                  r="14"
                  fill="url(#bgCircle)"
                  stroke="white"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <circle cx="340" cy="194" r="6" fill="url(#centerDot)" />
              </svg>
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

      {/* Background Wrapper */}
      <div style={styles.backgroundWrapper}>
        <div style={styles.globalOverlay}></div>
        <div style={styles.contentWrapper}>
          {/* Hero Section */}
          <div style={styles.section}>
            <div style={styles.heroContent}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div style={styles.badge}>
                  ✨ The Future of Education Communication
                </div>
              </motion.div>

              <div style={styles.marqueeWrapper}>
                <div className="marquee-track">
                  <span className="marquee-item">
                    Bridging the Gap Between&nbsp;
                    <span style={styles.gradientText}>Parents & Teachers</span>
                    <span style={styles.marqueSeparator}>✦</span>
                  </span>
                  <span className="marquee-item">
                    Bridging the Gap Between&nbsp;
                    <span style={styles.gradientText}>Parents & Teachers</span>
                    <span style={styles.marqueSeparator}>✦</span>
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <p style={styles.lightSubtitle}>
                  A powerful platform that connects parents and teachers in
                  real-time, enabling seamless communication, progress tracking,
                  and collaborative learning for student success.
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
          </div>

          {/* Features Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 style={styles.lightTitle}>
                Everything You Need in{" "}
                <span style={styles.gradientText}>One Platform</span>
              </h2>
              <p style={styles.lightSubtitle}>
                Powerful features designed to enhance communication and improve
                student outcomes
              </p>
              <div style={styles.cardsGrid}>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>
                    <FiMessageSquare size={28} />
                  </div>
                  <h3 style={styles.cardTitle}>Real-Time Communication</h3>
                  <p style={styles.cardDesc}>
                    Instant messaging between parents and teachers. Get
                    real-time updates about your child's progress, assignments,
                    and school activities.
                  </p>
                  <ul style={styles.cardList}>
                    <li>✓ Direct messaging</li>
                    <li>✓ Group conversations</li>
                    <li>✓ File sharing</li>
                  </ul>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>
                    <FiBarChart2 size={28} />
                  </div>
                  <h3 style={styles.cardTitle}>Progress Tracking</h3>
                  <p style={styles.cardDesc}>
                    Monitor academic performance with detailed grade reports and
                    analytics. Track improvement over time and identify areas
                    needing attention.
                  </p>
                  <ul style={styles.cardList}>
                    <li>✓ Grade history</li>
                    <li>✓ Performance analytics</li>
                    <li>✓ Subject-wise breakdown</li>
                  </ul>
                </div>
                <div style={styles.card}>
                  <div style={styles.cardIcon}>
                    <FiBell size={28} />
                  </div>
                  <h3 style={styles.cardTitle}>Smart Notifications</h3>
                  <p style={styles.cardDesc}>
                    Never miss important updates with real-time notifications
                    about grades, attendance, events, and parent-teacher
                    meetings.
                  </p>
                  <ul style={styles.cardList}>
                    <li>✓ Grade alerts</li>
                    <li>✓ Attendance updates</li>
                    <li>✓ Event reminders</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>
                    {loading ? "---" : `${formatNumber(stats.activeUsers)}+`}
                  </div>
                  <div style={styles.statLabel}>Active Users</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>
                    {loading ? "---" : `${formatNumber(stats.partnerSchools)}+`}
                  </div>
                  <div style={styles.statLabel}>Partner Schools</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>
                    {loading ? "---" : `${formatNumber(stats.messagesSent)}+`}
                  </div>
                  <div style={styles.statLabel}>Messages Sent</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>
                    {loading ? "---" : `${stats.satisfactionRate}%`}
                  </div>
                  <div style={styles.statLabel}>Satisfaction Rate</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* How It Works Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 style={styles.lightTitle}>How It Works</h2>
              <p style={styles.lightSubtitle}>Simple steps to get started</p>
              <div style={styles.cardsGrid}>
                <div style={styles.card}>
                  <div style={styles.stepNumber}>01</div>
                  <h3 style={styles.cardTitle}>Create Account</h3>
                  <p style={styles.cardDesc}>
                    Sign up as a parent or teacher with your details
                  </p>
                </div>
                <div style={styles.card}>
                  <div style={styles.stepNumber}>02</div>
                  <h3 style={styles.cardTitle}>Connect</h3>
                  <p style={styles.cardDesc}>
                    Link with your child's school or class
                  </p>
                </div>
                <div style={styles.card}>
                  <div style={styles.stepNumber}>03</div>
                  <h3 style={styles.cardTitle}>Start Collaborating</h3>
                  <p style={styles.cardDesc}>
                    Access grades, attendance, and start messaging
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Testimonials Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 style={styles.lightTitle}>What Our Community Says</h2>
              <p style={styles.lightSubtitle}>
                Trusted by thousands of parents and teachers
              </p>
              <div style={styles.cardsGrid}>
                <div style={styles.card}>
                  <div style={styles.quoteMark}>"</div>
                  <p style={styles.cardDesc}>
                    This platform has transformed how I communicate with my
                    child's teachers. I never miss an update and can track
                    progress in real-time.
                  </p>
                  <div style={styles.testimonialAuthor}>
                    <strong>Sarah Johnson</strong>
                    <span>Parent</span>
                  </div>
                  <div style={styles.rating}>★★★★★</div>
                </div>
                <div style={styles.card}>
                  <div style={styles.quoteMark}>"</div>
                  <p style={styles.cardDesc}>
                    The best tool for managing parent communication. Saves me
                    hours every week and keeps parents engaged in their child's
                    education.
                  </p>
                  <div style={styles.testimonialAuthor}>
                    <strong>Michael Chen</strong>
                    <span>Teacher</span>
                  </div>
                  <div style={styles.rating}>★★★★★</div>
                </div>
                <div style={styles.card}>
                  <div style={styles.quoteMark}>"</div>
                  <p style={styles.cardDesc}>
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
          </div>

          {/* CTA Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              style={styles.ctaInner}
            >
              <h2 style={styles.ctaTitle}>Ready to Transform Communication?</h2>
              <p style={styles.ctaText}>
                Join thousands of parents and teachers already using our
                platform
              </p>
              <Link to="/register">
                <button style={styles.ctaButton}>
                  Get Started Free{" "}
                  <FiArrowRight style={{ marginLeft: "8px" }} />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

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
            &copy; 2026 Parent-Teacher Relationship Portal. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        
      @keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  display: inline-flex;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
  will-change: transform;
}
.marquee-item {
  display: inline-flex;
  align-items: center;
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  padding-right: 80px;
}

        .nav-link:hover svg {
          transform: translateY(-2px);
        }
        
        .nav-link:hover {
          background: rgba(255,255,255,0.1);
          color: #c084fc;
        }
        
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .light-title { font-size: 32px !important; }
          .cards-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cta-inner { padding: 40px 20px !important; margin: 40px 16px !important; }
          .cta-title { font-size: 24px !important; }
          .main-title { font-size: 32px !important; }
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
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow:
      "0 0 20px rgba(102, 126, 234, 0.6), 0 0 40px rgba(192, 132, 252, 0.3)",
    border: "2px solid rgba(167, 139, 250, 0.6)",
    cursor: "pointer",
  },
  logoName: {
    fontSize: "20px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ffffff, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.3px",
  },
  navLinks: {
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
  navIcon: {
    transition: "transform 0.2s ease",
  },

  // Background Wrapper
  backgroundWrapper: {
    position: "relative",
    backgroundImage: "url('/images/ptot.jpg')",
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
  contentWrapper: {
    position: "relative",
    zIndex: 2,
  },

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

  marqueeWrapper: {
    overflow: "hidden",
    width: "100%",
    marginBottom: "20px",
    maskImage:
      "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
    WebkitMaskImage:
      "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  },
  marqueSeparator: {
    margin: "0 40px",
    color: "#a78bfa",
    fontSize: "24px",
  },

  mainTitle: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 1.2,
    letterSpacing: "-0.5px",
    whiteSpace: "nowrap",
    display: "inline-block",
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
    backgroundColor: "transparent",
    color: "#ffffff",
    border: "2px solid #ffffff",
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
    color: "#e0e0e0",
    fontSize: "14px",
  },

  lightTitle: {
    fontSize: "36px",
    fontWeight: "700",
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

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    padding: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    textAlign: "center",
  },
  cardIcon: {
    width: "56px",
    height: "56px",
    backgroundColor: "rgba(79,70,229,0.8)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    margin: "0 auto 20px auto",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#ffffff",
  },
  cardDesc: {
    fontSize: "14px",
    color: "#e0e0e0",
    lineHeight: "1.6",
    marginBottom: "16px",
  },
  cardList: {
    listStyle: "none",
    padding: 0,
    fontSize: "13px",
    color: "#e0e0e0",
    textAlign: "left",
    display: "inline-block",
  },

  stepNumber: {
    fontSize: "48px",
    fontWeight: "800",
    color: "rgba(199, 210, 254, 0.8)",
    marginBottom: "16px",
  },

  quoteMark: {
    fontSize: "48px",
    color: "rgba(199, 210, 254, 0.6)",
    lineHeight: 1,
    marginBottom: "8px",
  },
  testimonialAuthor: { marginBottom: "8px", color: "#ffffff" },
  rating: { fontSize: "14px", color: "#fbbf24" },

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
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "8px",
  },
  statLabel: { fontSize: "14px", color: "#e0e0e0" },

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
    display: "inline-flex",
    alignItems: "center",
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

export default HomePage;
