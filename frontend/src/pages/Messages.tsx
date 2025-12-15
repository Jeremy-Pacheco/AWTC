import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Chat from '../components/Chat';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export default function Messages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify authentication and get user data
    const storedToken = localStorage.getItem('jwtToken');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (!storedToken || !userName || !userRole) {
      navigate('/');
      return;
    }

    try {
      // Verify that user is admin or coordinator
      if (userRole !== 'admin' && userRole !== 'coordinator') {
        alert(t('chat.accessDenied'));
        navigate('/');
        return;
      }

      // Get userId from JWT token (decoded)
      const tokenParts = storedToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        setCurrentUser({
          id: payload.id || payload.userId,
          name: userName,
          email: payload.email || '',
          role: userRole
        });
        setToken(storedToken);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error parsing token data:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('chat.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[var(--bg-primary)]">
      <Chat currentUser={currentUser} token={token} />
    </div>
  );
}
