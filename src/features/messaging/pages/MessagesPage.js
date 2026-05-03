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
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../store/authStore";
import { messagingAPI } from "../../../services/api";

const normalizeId = (id) => {
  if (!id) return null;
  if (typeof id === "string") return id;
  if (typeof id === "object" && id.$oid) return id.$oid;
  if (typeof id === "object" && id._id) return normalizeId(id._id);
  return String(id);
};

const extractRecipient = (data, userRole) => {
  let rawId = null;
  let rawName = null;
  let studentId = null;
  let subject = null;

  if (userRole === "parent") {
    const possibleIds = [data.teacherId, data.teacherName];
    for (const p of possibleIds) {
      const id = normalizeId(p);
      if (id && id.length > 10) {
        rawId = id;
        break;
      }
    }
    rawName = possibleIds.find(
      (p) => !normalizeId(p) || normalizeId(p).length <= 10,
    );
    if (rawName && typeof rawName === "object")
      rawName = rawName.name || rawName.firstName || "User";
    studentId = data.studentId;
    subject = data.subject;
  } else if (userRole === "teacher") {
    const possibleIds = [data.parentId, data.teacherId, data.teacherName];
    for (const p of possibleIds) {
      const id = normalizeId(p);
      if (id && id.length > 10) {
        rawId = id;
        break;
      }
    }
    rawName = possibleIds.find(
      (p) => !normalizeId(p) || normalizeId(p).length <= 10,
    );
    if (rawName && typeof rawName === "object")
      rawName = rawName.name || rawName.firstName || "Parent";
    studentId = data.studentId;
    subject = data.subject;
  } else {
    rawId = normalizeId(data.id || data.teacherId || data.parentId);
    rawName = data.name || data.teacherName || data.parentName || "User";
    studentId = data.studentId;
    subject = data.subject;
  }

  if (!rawId && rawName) rawId = `temp_${Date.now()}`;
  if (!rawName) rawName = "User";

  return {
    recipientId: rawId,
    recipientName: String(rawName),
    studentId,
    subject,
  };
};

const MessagesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let rawUser = null;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        rawUser = JSON.parse(storedUser);
      } catch (e) {}
    }
    if (!rawUser && storeUser) rawUser = storeUser;
    if (rawUser) {
      const normalizedUser = {
        ...rawUser,
        id: normalizeId(rawUser.id || rawUser._id),
      };
      setUser(normalizedUser);
    }
  }, [storeUser]);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!user || loading) return;

    const directChat = localStorage.getItem("directChat");
    if (!directChat) return;
    localStorage.removeItem("directChat");

    try {
      const data = JSON.parse(directChat);
      const { recipientId, recipientName, studentId, subject } =
        extractRecipient(data, user.role);

      const existingConv = conversationsRef.current.find(
        (c) => c.id === recipientId || c.name === recipientName,
      );
      if (existingConv) {
        setSelectedConversation(existingConv);
        if (isMobileView) setShowChat(true);
        return;
      }

      const tempConv = {
        id: `temp_${recipientId || Date.now()}`,
        name: recipientName,
        avatar: getInitials(recipientName),
        lastMessage: t("no_messages_yet"),
        lastMessageTime: new Date(),
        unreadCount: 0,
        subject:
          subject || (user.role === "teacher" ? t("parent") : t("teacher")),
        role: user.role === "parent" ? "teacher" : "parent",
        online: false,
        temp: true,
        recipientId,
        studentId,
      };
      setSelectedConversation(tempConv);
      if (isMobileView) setShowChat(true);
      setMessages([]);
    } catch (e) {
      console.error("Failed to parse directChat", e);
    }
  }, [user, loading, isMobileView, t]);

  useEffect(() => {
    if (!selectedConversation || !user) return;
    const convId = selectedConversation.id;
    if (!convId || convId.toString().startsWith("temp_")) {
      setMessages([]);
      return;
    }
    fetchMessages(convId);
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    return date.toDateString() === now.toDateString()
      ? format(date, "h:mm a")
      : format(date, "MMM d");
  };

  const safeFormatDistance = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime()))
      return t("recently");
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return t("recently");
    }
  };

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

      let convData = [];
      if (user?.role === "teacher") {
        convData =
          response.data?.data?.students || response.data?.students || [];
      } else {
        convData = response.data?.data || response.data || [];
      }
      if (!Array.isArray(convData)) convData = [];

      let conversationsArray = [];

      if (user?.role === "parent") {
        const teacherMap = new Map();
        convData.forEach((child) => {
          (child.teachers || []).forEach((teacher) => {
            const id = teacher.conversationId || `temp_${teacher.teacherId}`;
            if (!teacherMap.has(id)) {
              teacherMap.set(id, {
                id: teacher.conversationId,
                name: teacher.teacherName,
                avatar: getInitials(teacher.teacherName),
                lastMessage: teacher.lastMessage || t("no_messages_yet"),
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
              lastMessage: student.lastMessage || t("no_messages_yet"),
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
        conversationsArray = convData.map((conv) => ({
          id: conv.id,
          name: conv.name,
          avatar: conv.avatar || getInitials(conv.name),
          lastMessage: conv.lastMessage || t("no_messages_yet"),
          lastMessageTime: conv.lastMessageTime
            ? new Date(conv.lastMessageTime)
            : new Date(),
          unreadCount: conv.unreadCount || 0,
          subject: conv.subject,
          role: conv.role,
          online: conv.online || false,
        }));
      }

      const validConversations = conversationsArray.filter(
        (conv) => conv.id != null,
      );
      validConversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      setConversations(validConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error(t("failed_load_conversations"));
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    if (!conversationId) return;
    try {
      await messagingAPI.markAsRead({ conversationId });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId || sendingRef.current) return;
    try {
      const response = await messagingAPI.getMessages(conversationId);
      let messagesData = response.data?.data || response.data || [];
      if (!Array.isArray(messagesData)) messagesData = [];

      const formatted = messagesData
        .map((msg) => {
          let rawSenderId = null;
          if (msg.senderId) {
            rawSenderId = normalizeId(msg.senderId);
          } else if (msg.sender) {
            if (typeof msg.sender === "object") {
              rawSenderId = normalizeId(msg.sender._id || msg.sender.id);
            } else {
              rawSenderId = normalizeId(msg.sender);
            }
          }
          const messageId = msg.id || msg._id;
          if (!messageId) return null;
          return {
            id: messageId,
            senderId: rawSenderId,
            senderName: msg.senderName || msg.sender?.name,
            content: msg.content,
            timestamp: msg.createdAt || msg.timestamp,
            read: msg.read || false,
          };
        })
        .filter((msg) => msg !== null && msg.id != null);

      setMessages(formatted);

      const ownId = normalizeId(user?.id);
      const hasUnread = formatted.some(
        (msg) => !msg.read && msg.senderId !== ownId,
      );
      if (hasUnread) markConversationAsRead(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    const isTemp = selectedConversation.id?.toString().startsWith("temp_");
    const messageContent = newMessage;
    setNewMessage("");
    setSendingMessage(true);
    sendingRef.current = true;

    const tempId = `temp_${Date.now()}`;
    const ownId = normalizeId(user?.id);
    const tempMsg = {
      id: tempId,
      senderId: ownId,
      senderName: user?.name,
      content: messageContent,
      timestamp: new Date().toISOString(),
      read: false,
      temp: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      if (isTemp) {
        const recipientId = selectedConversation.recipientId;
        const studentId = selectedConversation.studentId;

        if (user?.role === "parent") {
          await messagingAPI.sendParentToTeacher(
            recipientId,
            studentId,
            messageContent,
          );
        } else if (user?.role === "teacher") {
          await messagingAPI.sendTeacherToParent(
            recipientId,
            studentId,
            messageContent,
          );
        } else {
          await messagingAPI.sendDirectMessage({
            receiverId: recipientId,
            content: messageContent,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await fetchConversations();

        let foundConv = null;
        const currentConvs = conversationsRef.current;
        foundConv = currentConvs.find((c) => c.id === recipientId);
        if (!foundConv)
          foundConv = currentConvs.find(
            (c) => c.name === selectedConversation.name,
          );
        if (!foundConv && studentId)
          foundConv = currentConvs.find((c) => c.studentId === studentId);
        if (!foundConv && currentConvs.length === 1)
          foundConv = currentConvs[0];

        if (foundConv) {
          setSelectedConversation(foundConv);
          await fetchMessages(foundConv.id);
          toast.success(t("message_sent_saved"));
        } else {
          if (currentConvs.length > 0) {
            setSelectedConversation(currentConvs[0]);
            await fetchMessages(currentConvs[0].id);
            toast.success(t("message_sent_but_not_loaded"));
          } else {
            toast.error(t("message_sent_load_failed"));
            setSelectedConversation(null);
            setMessages([]);
          }
        }
      } else {
        const response = await messagingAPI.sendMessage({
          conversationId: selectedConversation.id,
          content: messageContent,
        });
        const raw =
          response?.data?.data ||
          response?.data?.message ||
          response?.data ||
          null;
        if (raw && (raw.id || raw._id)) {
          const confirmedMsg = {
            id: raw.id || raw._id,
            senderId: normalizeId(
              raw.senderId || raw.sender?._id || raw.sender?.id || user?.id,
            ),
            senderName: raw.senderName || raw.sender?.name || user?.name,
            content: raw.content || messageContent,
            timestamp:
              raw.createdAt || raw.timestamp || new Date().toISOString(),
            read: false,
          };
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? confirmedMsg : msg)),
          );
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, temp: false } : msg,
            ),
          );
        }
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: messageContent,
                  lastMessageTime: new Date(),
                }
              : conv,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(t("failed_send_message"));
      setNewMessage(messageContent);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setSendingMessage(false);
      sendingRef.current = false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conv) => {
    if (!conv || !conv.id) return;
    if (conv.id.toString().startsWith("temp_")) {
      toast.info(t("send_first_message"));
      return;
    }
    if (conv.unreadCount > 0) markConversationAsRead(conv.id);
    setSelectedConversation(conv);
    if (isMobileView) setShowChat(true);
  };

  const handleExitChat = () => {
    setSelectedConversation(null);
    setShowChat(false);
    setMessages([]);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!user) {
    return (
      <div style={Styles.loadingFull}>
        <div style={Styles.spinner} />
        <p style={Styles.loadingText}>{t("loading")}</p>
      </div>
    );
  }

  const ownUserId = normalizeId(user.id);

  return (
    <div style={Styles.page}>
      <div style={Styles.pageHeader}>
        <div>
          <h1 style={Styles.pageTitle}>{t("messages")}</h1>
          <p style={Styles.pageSubtitle}>
            {user.role === "parent"
              ? t("chat_with_teachers")
              : user.role === "teacher"
                ? t("chat_with_parents")
                : t("your_conversations")}
          </p>
        </div>
      </div>

      <div style={Styles.chatContainer}>
        <div
          style={{
            ...Styles.sidebar,
            ...(isMobileView && showChat ? Styles.sidebarHidden : {}),
          }}
        >
          <div style={Styles.searchWrap}>
            <FiSearch size={15} style={Styles.searchIcon} />
            <input
              type="text"
              placeholder={t("search_conversations")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={Styles.searchInput}
            />
          </div>
          <div style={Styles.convList}>
            {loading ? (
              <div style={Styles.centerState}>
                <div style={Styles.spinner} />
                <p style={Styles.loadingText}>{t("loading")}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={Styles.centerState}>
                <FiMessageSquare
                  size={40}
                  style={{ color: "#c4c9d4", marginBottom: 12 }}
                />
                <p style={{ ...Styles.loadingText, marginBottom: 12 }}>
                  {t("no_conversations")}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive =
                  selectedConversation?.id === conv.id && !isMobileView;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      ...Styles.convItem,
                      backgroundColor: isActive ? "#eef2ff" : "transparent",
                      borderLeft: isActive
                        ? "3px solid #4f46e5"
                        : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = "#f5f7ff";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={Styles.avatarWrap}>
                      <div style={Styles.avatar}>{conv.avatar}</div>
                      {conv.online && <span style={Styles.onlineDot} />}
                    </div>
                    <div style={Styles.convInfo}>
                      <div style={Styles.convRow}>
                        <span style={Styles.convName}>{conv.name}</span>
                        <span style={Styles.convTime}>
                          {safeFormatDistance(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p style={Styles.convPreview}>{conv.lastMessage}</p>
                      {conv.subject && (
                        <p style={Styles.convSubject}>{conv.subject}</p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div style={Styles.badge}>
                        <span style={Styles.badgeText}>{conv.unreadCount}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={Styles.chatArea}>
          {selectedConversation ? (
            <>
              <div style={Styles.chatHeader}>
                <div style={Styles.chatHeaderLeft}>
                  {isMobileView && (
                    <button onClick={handleExitChat} style={Styles.iconBtn}>
                      <FiArrowLeft size={20} color="#4f46e5" />
                    </button>
                  )}
                  <div style={Styles.chatAvatar}>
                    {selectedConversation.avatar}
                  </div>
                  <div>
                    <h3 style={Styles.chatName}>{selectedConversation.name}</h3>
                    <p style={Styles.chatMeta}>
                      {selectedConversation.role === "teacher"
                        ? t("teacher")
                        : t("parent")}
                      {selectedConversation.subject &&
                        ` · ${selectedConversation.subject}`}
                    </p>
                  </div>
                </div>
                {!isMobileView && (
                  <button onClick={handleExitChat} style={Styles.iconBtn}>
                    <FiX size={18} color="#ef4444" />
                  </button>
                )}
              </div>

              <div style={Styles.messagesArea}>
                {messages.length === 0 ? (
                  <div style={Styles.noMsgs}>
                    <FiMessageSquare
                      size={32}
                      style={{ color: "#c4c9d4", marginBottom: 8 }}
                    />
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>
                      {t("no_messages_yet")}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === ownUserId;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          ...Styles.msgRow,
                          flexDirection: isOwn ? "row-reverse" : "row",
                          gap: isOwn ? 8 : 0,
                        }}
                      >
                        <div
                          style={{
                            ...Styles.bubbleWrap,
                            alignItems: isOwn ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              ...Styles.bubble,
                              backgroundColor: isOwn ? "#4f46e5" : "#ffffff",
                              color: isOwn ? "#ffffff" : "#1f2937",
                              borderRadius: isOwn
                                ? "18px 18px 4px 18px"
                                : "18px 18px 18px 4px",
                              opacity: msg.temp ? 0.65 : 1,
                              boxShadow: isOwn
                                ? "0 1px 2px rgba(79,70,229,0.25)"
                                : "0 1px 2px rgba(0,0,0,0.08)",
                            }}
                          >
                            <p style={Styles.bubbleText}>{msg.content}</p>
                          </div>
                          <div
                            style={{
                              ...Styles.msgMeta,
                              justifyContent: isOwn ? "flex-end" : "flex-start",
                            }}
                          >
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {isOwn && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {msg.read ? (
                                  <FiCheckCircle size={11} color="#818cf8" />
                                ) : (
                                  <FiCheck size={11} color="#9ca3af" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={Styles.inputBar}>
                <button style={Styles.inputIconBtn} title={t("attach_file")}>
                  <FiPaperclip size={18} color="#9ca3af" />
                </button>
                <button style={Styles.inputIconBtn} title={t("emoji")}>
                  <FiSmile size={18} color="#9ca3af" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t("type_message")}
                  style={Styles.textarea}
                  rows={1}
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  style={{
                    ...Styles.sendBtn,
                    backgroundColor:
                      newMessage.trim() && !sendingMessage
                        ? "#4f46e5"
                        : "#e5e7eb",
                    cursor:
                      newMessage.trim() && !sendingMessage
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  <FiSend
                    size={18}
                    color={
                      newMessage.trim() && !sendingMessage ? "#fff" : "#9ca3af"
                    }
                  />
                </button>
              </div>
            </>
          ) : (
            <div style={Styles.noSelection}>
              <FiMessageSquare
                size={56}
                style={{ color: "#c4c9d4", marginBottom: 16 }}
              />
              <h3 style={Styles.noSelTitle}>{t("select_conversation")}</h3>
              <p style={Styles.noSelSub}>{t("select_instruction")}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const Styles = {
  page: {
    height: "calc(100vh - 64px)",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    backgroundColor: "#f8fafc",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1a1a2e",
    margin: "0 0 2px",
  },
  pageSubtitle: { fontSize: 13, color: "#6b7280", margin: 0 },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    minHeight: 0,
  },
  sidebar: {
    width: 300,
    minWidth: 300,
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
  },
  sidebarHidden: {
    width: 0,
    minWidth: 0,
    display: "none",
  },
  searchWrap: {
    position: "relative",
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
  },
  searchIcon: {
    position: "absolute",
    left: 28,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  searchInput: {
    width: "100%",
    padding: "9px 12px 9px 36px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
    backgroundColor: "#f9fafb",
    boxSizing: "border-box",
    color: "#1f2937",
  },
  convList: { flex: 1, overflowY: "auto" },
  centerState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    textAlign: "center",
    padding: 20,
  },
  loadingFull: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  spinner: {
    width: 28,
    height: 28,
    border: "3px solid #e5e7eb",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    marginBottom: 10,
  },
  loadingText: { color: "#9ca3af", fontSize: 13, margin: 0 },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "13px 16px",
    cursor: "pointer",
    transition: "background 0.15s",
    borderLeft: "3px solid transparent",
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    flexShrink: 0,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: "50%",
    backgroundColor: "#10b981",
    border: "2px solid #fff",
  },
  convInfo: { flex: 1, minWidth: 0 },
  convRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 6,
  },
  convName: {
    fontWeight: 600,
    color: "#1f2937",
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convTime: { fontSize: 11, color: "#9ca3af", flexShrink: 0 },
  convPreview: {
    fontSize: 12,
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    margin: "3px 0 0",
  },
  convSubject: { fontSize: 11, color: "#4f46e5", margin: "3px 0 0" },
  badge: {
    width: 20,
    height: 20,
    backgroundColor: "#4f46e5",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: 700 },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  chatHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  chatHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 600,
    fontSize: 13,
    flexShrink: 0,
  },
  chatName: { fontWeight: 600, color: "#1f2937", fontSize: 15, margin: 0 },
  chatMeta: { fontSize: 12, color: "#6b7280", margin: "2px 0 0" },
  iconBtn: {
    padding: 8,
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    backgroundColor: "#f0f2f5",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  noMsgs: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 6,
  },
  bubbleWrap: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "68%",
  },
  bubble: {
    padding: "9px 13px",
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  bubbleText: { margin: 0, fontSize: 14, lineHeight: 1.5 },
  msgMeta: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
    fontSize: 10,
    color: "#9ca3af",
  },
  inputBar: {
    padding: "12px 16px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    flexShrink: 0,
  },
  inputIconBtn: {
    padding: 8,
    background: "#f3f4f6",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    padding: "10px 13px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    outline: "none",
    resize: "none",
    fontFamily: "inherit",
    backgroundColor: "#f9fafb",
    color: "#1f2937",
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  noSelection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    padding: 40,
  },
  noSelTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: "#6b7280",
    margin: "0 0 6px",
  },
  noSelSub: { fontSize: 13, margin: 0, textAlign: "center" },
};

export default MessagesPage;
