import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { checkAuthStatus } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        // Redirect to login with return path
        navigate('/admin/login', {
          state: { from: location.pathname }
        });
        return;
      }

      try {
        await dispatch(checkAuthStatus() as any);
      } catch (error) {
        navigate('/admin/login', {
          state: { from: location.pathname }
        });
      }
    };

    verifyAuth();
  }, [dispatch, navigate, location, token]);

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
