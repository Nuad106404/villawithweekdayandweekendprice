import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AdminState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdmin() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Wait for auth to complete
        if (authLoading) return;

        if (!user) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: 'Not authenticated',
          });
          navigate('/login', { state: { from: window.location.pathname } });
          return;
        }

        // Check if user has admin role
        const isAdmin = user.role === 'admin';
        
        if (!isAdmin) {
          setState({
            isAdmin: false,
            isLoading: false,
            error: 'Insufficient permissions',
          });
          navigate('/', { replace: true });
          return;
        }

        setState({
          isAdmin: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          isAdmin: false,
          isLoading: false,
          error: 'Error checking admin status',
        });
      }
    };

    checkAdminStatus();
  }, [user, authLoading, navigate]);

  return state;
}
