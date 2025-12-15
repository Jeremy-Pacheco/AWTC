import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = API_URL.replace('/api', '');

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

interface Conversation {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  profileImage?: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

interface ChatProps {
  currentUser: User;
  token: string;
}

export default function Chat({ currentUser, token }: ChatProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedUserRef = useRef<User | null>(null);
  const shouldScrollRef = useRef<boolean>(true);
  
  // Helper function to show notification via Service Worker
  const showMessageNotification = async (msg: Message) => {
    try {
      // Try to use Service Worker notification first (more reliable in HTTP)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(`New message from ${msg.sender.name}`, {
          body: msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content,
          icon: msg.sender.profileImage ? `${BASE_URL}${msg.sender.profileImage}` : '/logo.png',
          tag: `message-${msg.id}`,
          requireInteraction: false,
          data: {
            url: '/messages',
            messageId: msg.id
          }
        });
        return;
      }
    } catch (err) {
      console.error('Service Worker notification failed:', err);
    }
    
    // Fallback to regular notification
    try {
      const notification = new Notification(`New message from ${msg.sender.name}`, {
        body: msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content,
        icon: msg.sender.profileImage ? `${BASE_URL}${msg.sender.profileImage}` : '/logo.png',
        tag: `message-${msg.id}`,
        requireInteraction: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error('Regular notification failed:', err);
    }
  };
  
  // Keep selectedUserRef updated
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Initialize Socket.IO
  useEffect(() => {
    const newSocket = io(API_URL, {
      auth: {
        userId: currentUser.id,
        userRole: currentUser.role
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('Server confirmation:', data);
    });

    newSocket.on('online_users', (data) => {
      setOnlineUsers(data.userIds);
    });

    newSocket.on('receive_message', (message: Message) => {
      console.log('Mensaje recibido:', message);
      
      // Determine the other user in the conversation
      const otherUserId = message.senderId === currentUser.id ? message.receiverId : message.senderId;
      const currentSelectedUser = selectedUserRef.current;
      
      console.log('Usuario seleccionado actual:', currentSelectedUser?.id);
      console.log('Usuario del mensaje:', otherUserId);
      console.log('¿Es conversación actual?', currentSelectedUser?.id === otherUserId);
      
      // Show notification if message is for current user and they're not viewing it
      const isOnMessagesPage = location.pathname === '/messages';
      const isViewingConversation = currentSelectedUser?.id === otherUserId;
      
      if (message.receiverId === currentUser.id && (!isOnMessagesPage || !isViewingConversation)) {
        // Show browser notification
        if ('Notification' in window) {
          // Request permission if not already granted
          if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                showMessageNotification(message);
              }
            }).catch(err => {
              console.error('Error requesting notification permission:', err);
            });
          } else if (Notification.permission === 'granted') {
            showMessageNotification(message);
          }
        }
      }
      
      // If message is from current conversation, add it
      if (currentSelectedUser && currentSelectedUser.id === otherUserId) {
        console.log('Agregando mensaje a la conversación actual');
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) {
            console.log('Mensaje duplicado, ignorando');
            return prev;
          }
          console.log('Agregando nuevo mensaje al estado');
          return [...prev, message];
        });
        
        // Mark as read automatically if we're viewing the conversation
        if (message.receiverId === currentUser.id) {
          newSocket.emit('mark_as_read', { messageId: message.id });
        }
      } else {
        console.log('Mensaje no es de la conversación actual, solo actualizando lista');
      }
      
      // Update conversation list
      loadConversations();
    });

    newSocket.on('message_sent', (message: Message) => {
      console.log('Mensaje enviado confirmado:', message);
      
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      
      // Update conversation list
      loadConversations();
    });

    newSocket.on('user_typing', (data) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setIsTyping(true);
      }
    });

    newSocket.on('user_stop_typing', (data) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setIsTyping(false);
      }
    });

    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
      alert(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [currentUser.id, currentUser.role]);

  // Notify backend about current page when location changes
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('update_page', { page: location.pathname });
    }
  }, [location.pathname, socket]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load available users
  const loadAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/available-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAvailableUsers(data);
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  // Load message history with a user
  const loadMessageHistory = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/messages/history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMessages(data);
      
      // Mark all received messages as read
      data.forEach((msg: Message) => {
        if (msg.receiverId === currentUser.id && !msg.isRead && socket) {
          socket.emit('mark_as_read', { messageId: msg.id });
        }
      });
    } catch (error) {
      console.error('Error loading message history:', error);
    }
  };

  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
  }, []);

  // Smart auto-scroll: only if user is near bottom or sent a message
  useEffect(() => {
    if (shouldScrollRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    loadMessageHistory(user.id);
    setIsTyping(false);
    setShowSidebar(false); // Close sidebar on mobile when selecting user
    
    // When switching conversation, scroll to bottom after loading
    setTimeout(() => {
      shouldScrollRef.current = true;
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedUser || !socket) return;

    socket.emit('send_message', {
      receiverId: selectedUser.id,
      content: messageInput.trim()
    });

    setMessageInput('');
    
    // Scroll when sending message
    shouldScrollRef.current = true;
    
    // Stop "typing" indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stop_typing', { receiverId: selectedUser.id });
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    
    if (!selectedUser || !socket) return;

    // Emit "typing" event
    socket.emit('typing', { receiverId: selectedUser.id });

    // Stop after 2 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { receiverId: selectedUser.id });
    }, 2000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const locale = i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    if (date.toDateString() === today.toDateString()) {
      return t('chat.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('chat.yesterday');
    } else {
      return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 dark:bg-[var(--bg-primary)] relative">
      {/* Mobile overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Sidebar - Conversation list */}
      <div className={`
        w-80 bg-white dark:bg-[var(--bg-secondary)] border-r border-gray-200 dark:border-gray-700 flex flex-col
        lg:relative lg:translate-x-0
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('chat.messages')}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? t('chat.connected') : t('chat.disconnected')}
            </span>
          </div>
        </div>

        {/* Search new user */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-[var(--bg-tertiary)] text-gray-800 dark:text-white"
            onChange={(e) => {
              const user = availableUsers.find(u => u.id === parseInt(e.target.value));
              if (user) handleSelectUser(user);
              e.target.value = '';
            }}
            defaultValue=""
          >
            <option value="" disabled>{t('chat.newMessage')}</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.userId}
              onClick={() => handleSelectUser({
                id: conv.userId,
                name: conv.userName,
                email: conv.userEmail,
                role: conv.userRole,
                profileImage: conv.profileImage
              })}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition ${
                selectedUser?.id === conv.userId 
                  ? 'bg-yellow-50 dark:!bg-[#1a1a1a]' 
                  : 'hover:bg-gray-50 dark:hover:!bg-[#252525]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    {conv.profileImage ? (
                      <>
                        <img 
                          src={`${BASE_URL}${conv.profileImage}`} 
                          alt={conv.userName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; 
                          }}
                        />
                        <div className="w-12 h-12 rounded-full bg-yellow-500 items-center justify-center text-white font-bold hidden">
                          {conv.userName.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                        {conv.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {onlineUsers.includes(conv.userId) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 dark:text-white truncate">{conv.userName}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(conv.lastMessageDate)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="ml-2 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[var(--bg-primary)] w-full">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-secondary)] flex items-center gap-3">
              {/* Button to open sidebar on mobile */}
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label="Abrir lista de conversaciones"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Selected user info */}
              <div className="flex items-center gap-3 flex-1">
                <div className="relative w-10 h-10">
                  {selectedUser.profileImage ? (
                    <>
                      <img 
                        src={`${BASE_URL}${selectedUser.profileImage}`} 
                        alt={selectedUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                      />
                      <div className="w-10 h-10 rounded-full bg-yellow-500 items-center justify-center text-white font-bold hidden">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                    </>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.role === 'admin' ? 'Admin' : 'Coordinator'}
                    {onlineUsers.includes(selectedUser.id) && (
                      <span className="ml-2 text-green-500">● {t('chat.online')}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[var(--bg-primary)]"
              onScroll={(e) => {
                const container = e.currentTarget;
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                // If user is near bottom, activate auto-scroll for new messages
                if (isNearBottom) {
                  shouldScrollRef.current = true;
                }
              }}
            >
              {messages.map((msg, index) => {
                const isOwnMessage = msg.senderId === currentUser.id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].createdAt) !== formatDate(msg.createdAt);

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-[var(--bg-secondary)] px-3 py-1 rounded-full">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-yellow-500 text-white rounded-br-none' 
                          : 'bg-white dark:bg-[var(--bg-secondary)] text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-none'
                      }`}>
                        <p className="break-words">{msg.content}</p>
                        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-yellow-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                          {isOwnMessage && (
                            <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-secondary)]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder={t('chat.typeMessage')}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-[var(--bg-tertiary)] text-gray-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !isConnected}
                  className="px-6 py-3 bg-[#F0BB00] text-black rounded-lg hover:bg-[#1f2124] hover:text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
                >
                  {t('chat.send')}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4">
            <div className="text-center">
              {/* Button to open sidebar on mobile when no conversation selected */}
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden mb-4 px-6 py-3 bg-[#F0BB00] text-black rounded-lg hover:bg-[#1f2124] hover:text-white transition flex items-center gap-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('chat.viewConversations')}
              </button>
              
              <svg className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-4 text-lg">{t('chat.selectConversation')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
