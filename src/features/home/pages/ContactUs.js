import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ContactUs = () => {
  const [scrolled, setScrolled] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
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
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={styles.heroTitle}>
              <span style={styles.gradientText}>Contact Us</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Have questions, feedback, or suggestions? We'd love to hear from
              you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info and Form Section */}
      <section style={styles.section}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div style={styles.contactGrid}>
            {/* Contact Info */}
            <div style={styles.contactInfo}>
              <div style={styles.infoCard}>
                <div style={styles.infoIcon}>📧</div>
                <h3 style={styles.infoTitle}>Email Us</h3>
                <p style={styles.infoDetail}>support@parentteacher.com</p>
                <p style={styles.infoSub}>info@parentteacher.com</p>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoIcon}>📞</div>
                <h3 style={styles.infoTitle}>Call Us</h3>
                <p style={styles.infoDetail}>+1 (555) 123-4567</p>
                <p style={styles.infoSub}>Mon-Fri, 9am-6pm</p>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoIcon}>📍</div>
                <h3 style={styles.infoTitle}>Visit Us</h3>
                <p style={styles.infoDetail}>123 Education Way</p>
                <p style={styles.infoSub}>Mekelle, Tigray Region</p>
              </div>
            </div>

            {/* Contact Form */}
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
                ></textarea>
                <button type="submit" style={styles.submitBtn}>
                  Send Message →
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={styles.mapContainer}
      >
        <iframe
          title="Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345095626!2d144.95373531531553!3d-37.81720997975165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f1c4eab%3A0x5045675218ceed30!2s123%20Education%20Way%2C%20Mekelle%2C%20Tigray%20Region!5e0!3m2!1sen!2set!4v1616151395517!5m2!1sen!2set"
          width="100%"
          height="300"
          style={styles.map}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </motion.div>

      {/* FAQ Section */}
      <section style={styles.section}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={styles.faq}
        >
          <h4 style={styles.sectionTitle}>Frequently Asked Questions</h4>
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
                Absolutely! We welcome all suggestions to improve our platform.
                Just let us know in your message!
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
                Basic support is free for all users. Premium support plans are
                available for schools and institutions.
              </p>
            </details>
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
    textAlign: "center",
    padding: "32px",
    backgroundColor: "#f8f9fa",
    borderRadius: "16px",
    transition: "transform 0.3s ease",
  },
  infoIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  infoTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#1a1a2e",
  },
  infoDetail: {
    fontSize: "16px",
    color: "#667eea",
    marginBottom: "4px",
  },
  infoSub: {
    fontSize: "14px",
    color: "#6c757d",
  },
  contactForm: {
    backgroundColor: "#f8f9fa",
    padding: "32px",
    borderRadius: "16px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "24px",
    color: "#1a1a2e",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 16px",
    marginBottom: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
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
  mapContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px 60px",
  },
  map: {
    border: 0,
    borderRadius: "16px",
  },
  faq: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  faqGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  faqItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    overflow: "hidden",
  },
  faqQuestion: {
    padding: "16px 20px",
    fontWeight: "600",
    color: "#1a1a2e",
    cursor: "pointer",
    listStyle: "none",
  },
  faqAnswer: {
    padding: "0 20px 16px 20px",
    color: "#6c757d",
    fontSize: "14px",
    lineHeight: "1.6",
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
  .info-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  a:hover {
    color: #667eea !important;
  }
  input:hover, textarea:hover {
    border-color: #667eea;
  }
  input:focus, textarea:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  details summary::-webkit-details-marker {
    display: none;
  }
  details summary {
    list-style: none;
    position: relative;
    cursor: pointer;
  }
  details summary::before {
    content: '▶';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #667eea;
    font-size: 12px;
  }
  details[open] summary::before {
    content: '▼';
  }
`;
document.head.appendChild(styleSheet);

export default ContactUs;
