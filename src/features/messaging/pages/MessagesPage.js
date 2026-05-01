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
  FiPlus,
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
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState(null);
  const [composeMessage, setComposeMessage] = useState("");

  const messagesEndRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Check mobile view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
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
    } else if (storeUser) {
      setUser(storeUser);
    }
  }, [storeUser]);

  // Fetch conversations when user loaded
  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  // Check for pending direct chat from dashboard
  useEffect(() => {
    if (!user) return;
    const directChat = localStorage.getItem("directChat");
    if (directChat) {
      localStorage.removeItem("directChat");
      try {
        const data = JSON.parse(directChat);
        if (user.role === "parent") {
          setComposeRecipient({
            teacherId: data.teacherId,
            name: data.teacherName,
            studentId: data.studentId,
            context: data.subject,
          });
        } else if (user.role === "teacher") {
          setComposeRecipient({
            parentId: data.teacherId,
            name: data.teacherName,
            studentId: data.studentId,
            context: data.subject,
          });
        } else {
          setComposeRecipient({
            id: data.teacherId || data.parentId,
            name: data.teacherName || data.parentName,
            context: data.subject,
          });
        }
        setShowComposeModal(true);
      } catch (e) {
        console.error("Failed to parse directChat", e);
      }
    }
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      let response;
      if (user?.role === "parent") {
        response = await messagingAPI.getParentChildren();
      } else if (user?.role === "teacher") {
        response = await messagingAPI.getTeacherStudents();
      } else {
        response = await messagingAPI.getConversations();
      }
      const convData = response.data?.data || response.data || [];
      let conversationsArray = [];

      if (user?.role === "parent") {
        // Deduplicate teachers across children by conversationId (or temp teacherId)
        const teacherMap = new Map();
        convData.forEach((child) => {
          (child.teachers || []).forEach((teacher) => {
            const id = teacher.conversationId || `temp_${teacher.teacherId}`;
            if (!teacherMap.has(id)) {
              teacherMap.set(id, {
                id: teacher.conversationId,
                name: teacher.teacherName,
                avatar: getInitials(teacher.teacherName),
                lastMessage: teacher.lastMessage || "No messages yet",
                lastMessageTime: teacher.lastMessageTime
                  ? new Date(teacher.lastMessageTime)
                  : new Date(),
                unreadCount: teacher.unreadCount || 0,
                subject: teacher.subject,
                role: "teacher",
                online: false,
              });
            } else {
              const existing = teacherMap.get(id);
              existing.unreadCount = teacher.unreadCount || 0;
              if (
                teacher.lastMessageTime &&
                new Date(teacher.lastMessageTime) > existing.lastMessageTime
              ) {
                existing.lastMessage = teacher.lastMessage;
                existing.lastMessageTime = new Date(teacher.lastMessageTime);
              }
            }
          });
        });
        conversationsArray = Array.from(teacherMap.values());
      } else if (user?.role === "teacher") {
        // Deduplicate parents across students by conversationId (or parentId)
        const parentMap = new Map();
        convData.forEach((student) => {
          const parent = student.parent;
          if (!parent) return;
          const id = student.conversationId || `temp_${parent.parentId}`;
          if (!parentMap.has(id)) {
            parentMap.set(id, {
              id: student.conversationId,
              name: parent.parentName,
              avatar: getInitials(parent.parentName),
              lastMessage: student.lastMessage || "No messages yet",
              lastMessageTime: student.lastMessageTime
                ? new Date(student.lastMessageTime)
                : new Date(),
              unreadCount: student.unreadCount || 0,
              subject: student.subject,
              role: "parent",
              online: false,
            });
          } else {
            const existing = parentMap.get(id);
            existing.unreadCount = student.unreadCount || 0;
            if (
              student.lastMessageTime &&
              new Date(student.lastMessageTime) > existing.lastMessageTime
            ) {
              existing.lastMessage = student.lastMessage;
              existing.lastMessageTime = new Date(student.lastMessageTime);
            }
          }
        });
        conversationsArray = Array.from(parentMap.values());
      } else {
        // admin or other
        conversationsArray = convData.map((conv) => ({
          id: conv.id,
          name: conv.name,
          avatar: conv.avatar || getInitials(conv.name),
          lastMessage: conv.lastMessage || "No messages yet",
          lastMessageTime: conv.lastMessageTime
            ? new Date(conv.lastMessageTime)
            : new Date(),
          unreadCount: conv.unreadCount || 0,
          subject: conv.subject,
          role: conv.role,
          online: conv.online || false,
        }));
      }

      // Sort by lastMessageTime (most recent first)
      conversationsArray.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      setConversations(conversationsArray);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversation || !user) return;
    if (
      selectedConversation.id &&
      selectedConversation.id.toString().startsWith("temp_")
    ) {
      // No real conversation yet, clear messages and wait for user to send first message
      setMessages([]);
      return;
    }
    fetchMessages(selectedConversation.id);
  }, [selectedConversation, user]);

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messagingAPI.getMessages(conversationId);
      let messagesData = response.data?.data || response.data || [];
      if (!Array.isArray(messagesData)) messagesData = [];
      const formattedMessages = messagesData.map((msg) => ({
        id: msg.id || msg._id,
        senderId: msg.senderId || msg.sender?.id,
        senderName: msg.senderName || msg.sender?.name,
        content: msg.content,
        timestamp: msg.createdAt || msg.timestamp,
        read: msg.read || false,
      }));
      setMessages(formattedMessages);
      // Mark unread messages as read
      const unreadMsgIds = formattedMessages
        .filter((msg) => !msg.read && msg.senderId !== user?.id)
        .map((msg) => msg.id);
      if (unreadMsgIds.length > 0) {
        await markMessagesAsRead(unreadMsgIds);
        setMessages((prev) =>
          prev.map((msg) =>
            unreadMsgIds.includes(msg.id) ? { ...msg, read: true } : msg,
          ),
        );
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setMessages([]);
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    try {
      await messagingAPI.markAsRead({ messageIds });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    if (
      selectedConversation.id &&
      selectedConversation.id.toString().startsWith("temp_")
    ) {
      toast.error("Please wait, conversation is being created...");
      return;
    }
    setSendingMessage(true);
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      id: tempId,
      senderId: user?.id,
      senderName: user?.name,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
    try {
      const response = await messagingAPI.sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage,
      });
      const realMsg = response.data?.data || response.data;
      const newMsg = {
        id: realMsg.id || realMsg._id,
        senderId: realMsg.senderId || user?.id,
        senderName: realMsg.senderName || user?.name,
        content: realMsg.content,
        timestamp: realMsg.createdAt || new Date().toISOString(),
        read: false,
      };
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? newMsg : msg)),
      );
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageTime: new Date(),
              }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendDirectMessage = async () => {
    if (!composeRecipient || !composeMessage.trim()) return;
    setSendingMessage(true);
    try {
      let response;
      if (user?.role === "parent") {
        response = await messagingAPI.sendParentToTeacher(
          composeRecipient.teacherId,
          composeRecipient.studentId,
          composeMessage,
        );
      } else if (user?.role === "teacher") {
        response = await messagingAPI.sendTeacherToParent(
          composeRecipient.parentId,
          composeRecipient.studentId,
          composeMessage,
        );
      } else {
        response = await messagingAPI.sendDirectMessage({
          receiverId: composeRecipient.id,
          content: composeMessage,
        });
      }
      toast.success(`Message sent to ${composeRecipient.name}`);
      setShowComposeModal(false);
      setComposeMessage("");
      setComposeRecipient(null);
      await fetchConversations();
    } catch (error) {
      console.error("Error sending direct message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
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
    if (conv.id && conv.id.toString().startsWith("temp_")) {
      toast.info("Start a conversation by sending a message first.");
      return;
    }
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

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    }
    return format(date, "MMM d");
  };

  const safeFormatDistance = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "recently";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Messages</h1>
          <p style={styles.pageSubtitle}>
            {user.role === "parent"
              ? "Chat with your child's teachers"
              : user.role === "teacher"
                ? "Chat with parents"
                : "Your conversations"}
          </p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          style={styles.composeBtn}
        >
          <FiPlus size={18} /> New Message
        </button>
      </div>

      <div style={styles.chatContainer}>
        {/* Conversations Sidebar */}
        <div
          style={{
            ...styles.conversationsSidebar,
            width: isMobileView && showChat ? "0" : "320px",
            minWidth: isMobileView && showChat ? "0" : "320px",
            display: isMobileView && showChat ? "none" : "flex",
          }}
        >
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
                <button
                  onClick={() => setShowComposeModal(true)}
                  style={styles.emptyBtn}
                >
                  Start a conversation
                </button>
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
                        {safeFormatDistance(conv.lastMessageTime)}
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
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderLeft}>
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
                {!isMobileView && (
                  <button onClick={handleExitChat} style={styles.closeBtn}>
                    <FiX size={18} style={{ color: "#ef4444" }} />
                  </button>
                )}
              </div>

              <div style={styles.messagesArea}>
                {messages.length === 0 ? (
                  <div style={styles.noMessagesState}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
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
                              backgroundColor: isOwnMessage
                                ? "#4f46e5"
                                : "white",
                              color: isOwnMessage ? "white" : "#1f2937",
                              borderBottomRightRadius: isOwnMessage
                                ? "4px"
                                : "18px",
                              borderBottomLeftRadius: isOwnMessage
                                ? "18px"
                                : "4px",
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
                  })
                )}
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
                Select a conversation from the list or start a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>New Message</h3>
              <button
                onClick={() => setShowComposeModal(false)}
                style={styles.modalClose}
              >
                <FiX size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              {composeRecipient ? (
                <div style={styles.recipientInfo}>
                  <strong>To:</strong> {composeRecipient.name}
                  {composeRecipient.context && (
                    <span style={styles.recipientContext}>
                      {" "}
                      ({composeRecipient.context})
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Recipient name or ID"
                  style={styles.modalInput}
                  onChange={(e) =>
                    setComposeRecipient({
                      id: e.target.value,
                      name: e.target.value,
                    })
                  }
                />
              )}
              <textarea
                placeholder="Type your message..."
                rows={4}
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                style={styles.modalTextarea}
              />
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowComposeModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSendDirectMessage}
                disabled={!composeMessage.trim() || !composeRecipient}
                style={{
                  ...styles.sendDirectBtn,
                  opacity:
                    !composeMessage.trim() || !composeRecipient ? 0.5 : 1,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 4px",
  },
  pageSubtitle: { fontSize: "14px", color: "#6b7280", margin: 0 },
  composeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
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
  searchSection: { padding: "16px", borderBottom: "1px solid #e5e7eb" },
  searchWrapper: { position: "relative" },
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
  conversationsList: { flex: 1, overflowY: "auto" },
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
  loadingText: { color: "#9ca3af", fontSize: "14px", margin: 0 },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "256px",
    textAlign: "center",
    color: "#9ca3af",
  },
  emptyIcon: { marginBottom: "12px" },
  emptyText: { fontSize: "14px", margin: 0 },
  emptyBtn: {
    marginTop: "12px",
    padding: "6px 12px",
    backgroundColor: "#eef2ff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "12px",
    color: "#4f46e5",
  },
  conversationItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  avatarWrapper: { position: "relative" },
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
  conversationInfo: { flex: 1, minWidth: 0 },
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
  unreadCount: { color: "white", fontSize: "11px", fontWeight: "600" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column" },
  chatHeader: {
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: "12px" },
  mobileBackBtn: {
    padding: "8px",
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  chatRole: { fontSize: "12px", color: "#6b7280", margin: "2px 0 0" },
  closeBtn: {
    padding: "8px",
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f9fafb",
  },
  messageRow: { display: "flex", marginBottom: "16px" },
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
  messageContent: { fontSize: "14px", lineHeight: "1.5", margin: 0 },
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
  noSelectionIcon: { marginBottom: "16px" },
  noSelectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "16px",
    color: "#6b7280",
    margin: 0,
  },
  noSelectionText: { fontSize: "14px", marginTop: "4px", margin: 0 },
  noMessagesState: { textAlign: "center", padding: "40px", color: "#9ca3af" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  modalClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
  },
  modalBody: { padding: "20px" },
  modalLabel: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 500,
    fontSize: "14px",
  },
  loadingContacts: { textAlign: "center", padding: "20px", color: "#6b7280" },
  emptyContacts: { textAlign: "center", padding: "20px", color: "#9ca3af" },
  contactsList: { maxHeight: "300px", overflowY: "auto", marginTop: "12px" },
  contactItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  contactAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "600",
  },
  contactInfo: { flex: 1 },
  contactName: { fontWeight: "600", color: "#1f2937" },
  contactContext: { fontSize: "12px", color: "#6b7280" },
  contactIcon: { color: "#9ca3af" },
  selectedContact: {
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "12px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  editContactBtn: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "auto",
  },
  modalTextarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  cancelBtn: {
    padding: "8px 16px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  sendDirectBtn: {
    padding: "8px 16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  recipientInfo: {
    marginBottom: "12px",
    fontSize: "14px",
    color: "#374151",
  },
  recipientContext: { fontSize: "12px", color: "#6b7280" },
  modalInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "14px",
  },
};

export default MessagesPage;
