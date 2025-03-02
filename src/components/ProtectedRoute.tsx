
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Modified to always allow access, bypassing authentication check
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Auth check disabled temporarily
  return <>{children}</>;
};

export default ProtectedRoute;
