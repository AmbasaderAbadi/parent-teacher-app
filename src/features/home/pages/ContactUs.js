import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUserCheck,
  FiMail,
  FiCompass,
  FiMapPin,
  FiPhone,
  FiMail as FiMailIcon,
} from "react-icons/fi";
import { contactAPI } from "../../../services/api";
import toast from "react-hot-toast";

const ContactUs = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      // Simulate API call – replace with actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                <div style={styles.badge}>📬 Get in Touch</div>
                <h1 style={styles.lightTitle}>
                  <span style={styles.gradientText}>Contact Us</span>
                </h1>
                <p style={styles.lightSubtitle}>
                  Have questions, feedback, or suggestions? We'd love to hear
                  from you!
                </p>
              </motion.div>
            </div>
          </div>

          {/* Contact Info and Form Section */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div style={styles.contactGrid}>
                {/* Contact Info Cards (glassmorphic) */}
                <div style={styles.contactInfo}>
                  <div style={styles.infoCard}>
                    <div style={styles.infoIcon}>
                      <FiMailIcon size={32} />
                    </div>
                    <h3 style={styles.infoTitle}>Email Us</h3>
                    <p style={styles.infoDetail}>support@parentteacher.com</p>
                    <p style={styles.infoSub}>info@parentteacher.com</p>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoIcon}>
                      <FiPhone size={32} />
                    </div>
                    <h3 style={styles.infoTitle}>Call Us</h3>
                    <p style={styles.infoDetail}>+251 962690648</p>
                    <p style={styles.infoSub}>Mon-Fri, 9am-6pm</p>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoIcon}>
                      <FiMapPin size={32} />
                    </div>
                    <h3 style={styles.infoTitle}>Visit Us</h3>
                    <p style={styles.infoDetail}>123 Education Way</p>
                    <p style={styles.infoSub}>Mekelle, Tigray Region</p>
                  </div>
                </div>

                {/* Contact Form (glassmorphic) */}
                <div style={styles.contactForm}>
                  <h3 style={styles.formTitle}>Send Us a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                    <textarea
                      name="message"
                      placeholder="Your Message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      style={styles.textarea}
                      required
                    />
                    <button
                      type="submit"
                      style={styles.submitBtn}
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message →"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map Section (glass container) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={styles.mapContainer}
          >
            <div style={styles.mapCard}>
              <iframe
                title="Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345095626!2d144.95373531531553!3d-37.81720997975165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f1c4eab%3A0x5045675218ceed30!2s123%20Education%20Way%2C%20Mekelle%2C%20Tigray%20Region!5e0!3m2!1sen!2set!4v1616151395517!5m2!1sen!2set"
                width="100%"
                height="300"
                style={styles.map}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* FAQ Section (glass cards) */}
          <div style={styles.section}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 style={styles.lightTitle}>Frequently Asked Questions</h2>
              <p style={styles.lightSubtitle}>Find answers to common queries</p>
              <div style={styles.faqGrid}>
                <details style={styles.faqItem}>
                  <summary style={styles.faqQuestion}>
                    How long does it take to get a response?
                  </summary>
                  <p style={styles.faqAnswer}>
                    We aim to respond to all inquiries within 24-48 hours during
                    business days.
                  </p>
                </details>
                <details style={styles.faqItem}>
                  <summary style={styles.faqQuestion}>
                    Can I suggest a feature for the platform?
                  </summary>
                  <p style={styles.faqAnswer}>
                    Absolutely! We welcome all suggestions to improve our
                    platform. Just let us know in your message!
                  </p>
                </details>
                <details style={styles.faqItem}>
                  <summary style={styles.faqQuestion}>
                    Do you offer technical support?
                  </summary>
                  <p style={styles.faqAnswer}>
                    Yes, we provide technical support for all users. Our support
                    team is available via email and phone.
                  </p>
                </details>
                <details style={styles.faqItem}>
                  <summary style={styles.faqQuestion}>
                    Is there a cost for support?
                  </summary>
                  <p style={styles.faqAnswer}>
                    Basic support is free for all users. Premium support plans
                    are available for schools and institutions.
                  </p>
                </details>
              </div>
            </motion.div>
          </div>

          {/* Call to Action (glass style) */}
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
            <p style={styles.footerText}>📞 +251 (9) 62690648</p>
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
        .info-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .nav-link:hover svg { transform: translateY(-2px); }
        .nav-link:hover { background: rgba(255,255,255,0.1); color: #c084fc; }
        input:focus, textarea:focus { 
          border-color: #667eea; 
          outline: none; 
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        details summary::-webkit-details-marker { display: none; }
        details summary {
          list-style: none;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .contact-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .contact-info { grid-template-columns: 1fr !important; gap: 16px !important; }
          .info-card { 
            display: flex !important; 
            flex-direction: row !important; 
            align-items: center !important; 
            gap: 16px !important; 
            text-align: left !important; 
            padding: 20px !important; 
          }
          .info-icon { margin-bottom: 0 !important; flex-shrink: 0 !important; }
          .info-title { margin-bottom: 4px !important; font-size: 18px !important; }
          .info-detail { font-size: 14px !important; }
          .info-sub { font-size: 12px !important; }
          .contact-form { padding: 24px !important; }
          .form-title { font-size: 20px !important; }
          .light-title { font-size: 32px !important; }
          .light-subtitle { font-size: 16px !important; }
          .cta-inner { padding: 40px 20px !important; margin: 0 16px 40px !important; }
          .cta-title { font-size: 24px !important; }
          .footer-content { grid-template-columns: 1fr !important; text-align: center; }
          .footer-section { align-items: center !important; }
          .map-card { margin: 0 16px !important; }
        }
        @media (max-width: 480px) {
          .light-title { font-size: 28px !important; }
          .light-subtitle { font-size: 14px !important; }
          .info-icon svg { width: 24px !important; height: 24px !important; }
          .info-title { font-size: 16px !important; }
          .info-detail { font-size: 13px !important; }
          .input, .textarea { padding: 10px 14px !important; font-size: 14px !important; }
          .submit-btn { padding: 10px 20px !important; font-size: 14px !important; }
          .faq-question { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Inter', sans-serif" },

  // Navigation - Dark background (same as homepage)
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

  // Background and overlay (matching homepage)
  backgroundWrapper: {
    position: "relative",
    backgroundImage: "url('/images/cuss.jpg')",
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

  // Contact Grid
  contactGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "40px",
  },
  contactInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "24px",
  },
  infoCard: {
    padding: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    textAlign: "center",
  },
  infoIcon: {
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
  infoTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#ffffff",
  },
  infoDetail: { fontSize: "16px", color: "#c084fc", marginBottom: "4px" },
  infoSub: { fontSize: "14px", color: "#e0e0e0" },

  contactForm: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "32px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#ffffff",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    backgroundColor: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#ffffff",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    backgroundColor: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#ffffff",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Map Section
  mapContainer: { padding: "0 24px 40px" },
  mapCard: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  map: { border: 0, display: "block" },

  // FAQ Section
  faqGrid: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  faqItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  faqQuestion: {
    padding: "16px 20px",
    fontWeight: "600",
    color: "#ffffff",
    cursor: "pointer",
    listStyle: "none",
    position: "relative",
  },
  faqAnswer: {
    padding: "0 20px 16px 20px",
    color: "#e0e0e0",
    fontSize: "14px",
    lineHeight: "1.6",
  },

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
    display: "inline-flex",
    alignItems: "center",
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

export default ContactUs;
