
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps = {}) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Temporary immediate rendering for development
  return children ? <>{children}</> : <Outlet />;
  
  // Original authentication check code (commented out for now)
  /*
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, render the protected content
  return children ? <>{children}</> : <Outlet />;
  */
};

export default ProtectedRoute;
