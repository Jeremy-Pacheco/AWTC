import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingMessageButton() {
  const [show, setShow] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated and is admin or coordinator
    const checkAuth = () => {
      const userRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('jwtToken');
      
      if (token && (userRole === 'admin' || userRole === 'coordinator')) {
        setShow(true);
        loadUnreadCount(token);
      } else {
        setShow(false);
      }
    };

    checkAuth();

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Update counter every 30 seconds
    const interval = setInterval(() => {
      const token = localStorage.getItem('jwtToken');
      if (token && show) {
        loadUnreadCount(token);
      }
    }, 30000);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      clearInterval(interval);
    };
  }, [show]);

  const loadUnreadCount = async (token: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Don't show button if you're on the messages page
  if (!show || location.pathname === '/messages') return null;

  return (
    <button
      onClick={() => navigate('/messages')}
      className="fixed bottom-6 right-6 z-50 bg-[#F0BB00] hover:bg-[#d9a700] text-black rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
      aria-label="Open messages"
    >
      {/* Message icon */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-7 w-7" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>

      {/* Unread message counter */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Mensajes
      </span>
    </button>
  );
}
