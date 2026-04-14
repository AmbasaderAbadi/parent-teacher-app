// MessagesPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiSearch,
  FiMessageSquare,
  FiCheck,
  FiCheckCircle,
  FiArrowLeft,
  FiPaperclip,
  FiSmile,
  FiX,
} from "react-icons/fi";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/authStore";
import { useAuth } from "../../../contexts/AuthContext";
import { messagingAPI } from "../../../services/api";

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();
  const { logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Check mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  // Fetch conversations from API
  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // This endpoint needs to be created by your backend teammate
      // const response = await messagingAPI.getConversations();
      // const conversationsData = response.data;

      // Mock data for demonstration
      setTimeout(() => {
        let demoConversations = [];

        if (user.role === "parent") {
          demoConversations = [
            {
              id: 1,
              name: "Ms. Sarah Johnson",
              role: "Teacher",
              avatar: "SJ",
              lastMessage: "Your child is doing great in mathematics!",
              lastMessageTime: new Date().toISOString(),
              unreadCount: 2,
              online: true,
              subject: "Mathematics",
              teacherId: "teacher123",
              recipientId: "teacher123",
            },
            {
              id: 2,
              name: "Mr. Michael Chen",
              role: "Teacher",
              avatar: "MC",
              lastMessage: "When is the parent-teacher meeting?",
              lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
              unreadCount: 0,
              online: false,
              subject: "Science",
              teacherId: "teacher456",
              recipientId: "teacher456",
            },
          ];
        } else if (user.role === "teacher") {
          demoConversations = [
            {
              id: 1,
              name: "John Doe (Parent)",
              role: "Parent",
              avatar: "JD",
              lastMessage: "How is my child doing in class?",
              lastMessageTime: new Date().toISOString(),
              unreadCount: 1,
              online: true,
              subject: "Parent of John Doe",
              parentId: "parent123",
              recipientId: "parent123",
            },
            {
              id: 2,
              name: "Emma Smith (Parent)",
              role: "Parent",
              avatar: "ES",
              lastMessage: "Thanks for the update!",
              lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
              unreadCount: 0,
              online: false,
              subject: "Parent of Emma Smith",
              parentId: "parent456",
              recipientId: "parent456",
            },
          ];
        }

        setConversations(demoConversations);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
      setLoading(false);
    }
  };

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user) return;
    fetchMessages(selectedConversation.id);
  }, [selectedConversation, user]);

  const fetchMessages = async (conversationId) => {
    try {
      // This endpoint needs to be created by your backend teammate
      // const response = await messagingAPI.getMessages(conversationId);
      // const messagesData = response.data;

      // Mock messages for demonstration
      const demoMessages = [
        {
          id: 1,
          senderId: conversationId,
          senderName: selectedConversation.name,
          content: `Hello! I wanted to discuss ${selectedConversation.subject} with you.`,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
        },
        {
          id: 2,
          senderId: user?.id,
          senderName: user?.name,
          content: "Thank you for reaching out. How is everything going?",
          timestamp: new Date(Date.now() - 86400000 + 3600000).toISOString(),
          read: true,
        },
        {
          id: 3,
          senderId: conversationId,
          senderName: selectedConversation.name,
          content:
            "Everything is going well! The student is showing great improvement.",
          timestamp: new Date(Date.now() - 43200000).toISOString(),
          read: true,
        },
      ];
      setMessages(demoMessages);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Mark messages as read
      if (selectedConversation.unreadCount > 0) {
        markConversationAsRead(selectedConversation.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      // This endpoint needs to be created
      // await messagingAPI.markAsRead(conversationId);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);

    const tempId = Date.now();
    const newMsg = {
      id: tempId,
      senderId: user?.id,
      senderName: user?.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      temp: true,
    };

    // Optimistically add message
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      // Send message to API
      // This endpoint needs to be created by your backend teammate
      // const response = await messagingAPI.sendMessage({
      //   conversationId: selectedConversation.id,
      //   recipientId: selectedConversation.recipientId,
      //   content: newMessage,
      // });

      // Replace temp message with real one
      // const realMessage = response.data;
      // setMessages((prev) =>
      //   prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      // );

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation?.id
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageTime: new Date().toISOString(),
              }
            : conv,
        ),
      );

      // Simulate reply (remove in production)
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const replyMsg = {
          id: Date.now() + 1,
          senderId: selectedConversation?.id,
          senderName: selectedConversation?.name,
          content: "Thanks for your message! I'll get back to you soon.",
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages((prev) => [...prev, replyMsg]);
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation?.id
              ? {
                  ...conv,
                  lastMessage: replyMsg.content,
                  lastMessageTime: new Date().toISOString(),
                }
              : conv,
          ),
        );
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    if (isMobileView) setShowChat(true);
  };

  const handleExitChat = () => {
    setSelectedConversation(null);
    setShowChat(false);
    setMessages([]);
  };

  const handleChatAreaClick = (e) => {
    if (chatAreaRef.current && e.target === chatAreaRef.current) {
      handleExitChat();
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    }
    return format(date, "MMM d");
  };

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Messages</h1>
        <p style={styles.pageSubtitle}>
          {user.role === "parent"
            ? "Chat with your child's teachers"
            : user.role === "teacher"
              ? "Chat with parents"
              : "Your conversations"}
        </p>
      </div>

      {/* Main Chat Container */}
      <div style={styles.chatContainer}>
        {/* Sidebar - Conversations List */}
        <div
          style={{
            ...styles.conversationsSidebar,
            width: isMobileView && showChat ? "0" : "320px",
            minWidth: isMobileView && showChat ? "0" : "320px",
            display: isMobileView && showChat ? "none" : "flex",
          }}
        >
          {/* Search */}
          <div style={styles.searchSection}>
            <div style={styles.searchWrapper}>
              <FiSearch style={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={styles.conversationsList}>
            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={styles.emptyState}>
                <FiMessageSquare size={48} style={styles.emptyIcon} />
                <p style={styles.emptyText}>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    ...styles.conversationItem,
                    backgroundColor:
                      selectedConversation?.id === conv.id && !isMobileView
                        ? "#eef2ff"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConversation?.id !== conv.id)
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConversation?.id !== conv.id)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={styles.avatarWrapper}>
                    <div style={styles.avatar}>{conv.avatar}</div>
                    {conv.online && <span style={styles.onlineDot} />}
                  </div>
                  <div style={styles.conversationInfo}>
                    <div style={styles.conversationHeader}>
                      <h3 style={styles.conversationName}>{conv.name}</h3>
                      <span style={styles.conversationTime}>
                        {formatDistanceToNow(new Date(conv.lastMessageTime), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p style={styles.conversationLastMessage}>
                      {conv.lastMessage}
                    </p>
                    <p style={styles.conversationSubject}>{conv.subject}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div style={styles.unreadBadge}>
                      <span style={styles.unreadCount}>{conv.unreadCount}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          ref={chatAreaRef}
          onClick={handleChatAreaClick}
          style={styles.chatArea}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderLeft}>
                  {/* Mobile back button */}
                  {isMobileView && (
                    <button
                      onClick={handleExitChat}
                      style={styles.mobileBackBtn}
                    >
                      <FiArrowLeft size={20} style={{ color: "#4f46e5" }} />
                    </button>
                  )}
                  <div style={styles.chatAvatar}>
                    {selectedConversation.avatar}
                  </div>
                  <div>
                    <h3 style={styles.chatName}>{selectedConversation.name}</h3>
                    <p style={styles.chatRole}>
                      {selectedConversation.role} •{" "}
                      {selectedConversation.subject}
                    </p>
                  </div>
                </div>
                {/* Desktop close button */}
                {!isMobileView && (
                  <button onClick={handleExitChat} style={styles.closeBtn}>
                    <FiX size={18} style={{ color: "#ef4444" }} />
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div style={styles.messagesArea}>
                {messages.map((msg) => {
                  const isOwnMessage = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageRow,
                        justifyContent: isOwnMessage
                          ? "flex-end"
                          : "flex-start",
                      }}
                    >
                      {!isOwnMessage && (
                        <div style={styles.messageAvatar}>
                          {selectedConversation.avatar}
                        </div>
                      )}
                      <div style={{ maxWidth: "70%" }}>
                        <div
                          style={{
                            ...styles.messageBubble,
                            backgroundColor: isOwnMessage ? "#4f46e5" : "white",
                            color: isOwnMessage ? "white" : "#1f2937",
                            borderBottomRightRadius: isOwnMessage
                              ? "4px"
                              : "18px",
                            borderBottomLeftRadius: isOwnMessage
                              ? "18px"
                              : "4px",
                            boxShadow: !isOwnMessage
                              ? "0 1px 2px rgba(0,0,0,0.05)"
                              : "none",
                            opacity: msg.temp ? 0.7 : 1,
                          }}
                        >
                          <p style={styles.messageContent}>{msg.content}</p>
                        </div>
                        <div
                          style={{
                            ...styles.messageMeta,
                            justifyContent: isOwnMessage
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {isOwnMessage && (
                            <span>
                              {msg.read ? (
                                <FiCheckCircle size={12} />
                              ) : (
                                <FiCheck size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {typing && (
                  <div style={styles.typingRow}>
                    <div style={styles.messageAvatar}>
                      {selectedConversation.avatar}
                    </div>
                    <div style={styles.typingBubble}>
                      <span style={styles.typingDot} />
                      <span
                        style={{ ...styles.typingDot, animationDelay: "0.2s" }}
                      />
                      <span
                        style={{ ...styles.typingDot, animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={styles.messageInput}>
                <button style={styles.inputBtn} title="Attach file">
                  <FiPaperclip size={20} style={{ color: "#6b7280" }} />
                </button>
                <button style={styles.inputBtn} title="Add emoji">
                  <FiSmile size={20} style={{ color: "#6b7280" }} />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  style={styles.textarea}
                  rows={1}
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  style={{
                    ...styles.sendBtn,
                    backgroundColor:
                      newMessage.trim() && !sendingMessage
                        ? "#4f46e5"
                        : "#e5e7eb",
                    color:
                      newMessage.trim() && !sendingMessage
                        ? "white"
                        : "#9ca3af",
                    cursor:
                      newMessage.trim() && !sendingMessage
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </>
          ) : (
            <div style={styles.noSelection}>
              <FiMessageSquare size={64} style={styles.noSelectionIcon} />
              <h3 style={styles.noSelectionTitle}>No conversation selected</h3>
              <p style={styles.noSelectionText}>
                Select a conversation from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
};

const styles = {
  pageContainer: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    backgroundColor: "#f8fafc",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  pageHeader: {
    marginBottom: "20px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    minHeight: 0,
  },
  conversationsSidebar: {
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  searchSection: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
  },
  searchWrapper: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px 10px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
  },
  conversationsList: {
    flex: 1,
    overflowY: "auto",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "256px",
    textAlign: "center",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "12px",
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: "14px",
    margin: 0,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "256px",
    textAlign: "center",
    color: "#9ca3af",
  },
  emptyIcon: {
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "14px",
    margin: 0,
  },
  conversationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
  },
  onlineDot: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
    border: "2px solid white",
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  conversationName: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: "15px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    margin: 0,
  },
  conversationTime: {
    fontSize: "11px",
    color: "#9ca3af",
    marginLeft: "8px",
    flexShrink: 0,
  },
  conversationLastMessage: {
    fontSize: "13px",
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    margin: "4px 0 0",
  },
  conversationSubject: {
    fontSize: "12px",
    color: "#4f46e5",
    margin: "4px 0 0",
  },
  unreadBadge: {
    width: "20px",
    height: "20px",
    backgroundColor: "#4f46e5",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  unreadCount: {
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  mobileBackBtn: {
    padding: "8px",
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  chatAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  chatName: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: "16px",
    margin: 0,
  },
  chatRole: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "2px 0 0",
  },
  closeBtn: {
    padding: "8px",
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    transition: "all 0.2s ease",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f9fafb",
  },
  messageRow: {
    display: "flex",
    marginBottom: "16px",
  },
  messageAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
    fontSize: "12px",
    marginRight: "8px",
    flexShrink: 0,
  },
  messageBubble: {
    padding: "10px 14px",
    borderRadius: "18px",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
  },
  messageContent: {
    fontSize: "14px",
    lineHeight: "1.5",
    margin: 0,
  },
  messageMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
    fontSize: "10px",
    color: "#9ca3af",
  },
  typingRow: {
    display: "flex",
    marginBottom: "16px",
    justifyContent: "flex-start",
  },
  typingBubble: {
    backgroundColor: "white",
    borderRadius: "18px",
    borderBottomLeftRadius: "4px",
    padding: "12px 16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    display: "flex",
    gap: "4px",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#9ca3af",
    borderRadius: "50%",
    animation: "bounce 0.6s infinite",
    display: "inline-block",
  },
  messageInput: {
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "white",
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  inputBtn: {
    padding: "8px",
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    transition: "all 0.2s ease",
  },
  textarea: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    padding: "8px",
    borderRadius: "50%",
    border: "none",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  noSelection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#9ca3af",
  },
  noSelectionIcon: {
    marginBottom: "16px",
  },
  noSelectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "16px",
    color: "#6b7280",
    margin: 0,
  },
  noSelectionText: {
    fontSize: "14px",
    marginTop: "4px",
    margin: 0,
  },
};

export default MessagesPage;
