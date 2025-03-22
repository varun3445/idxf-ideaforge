
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Temporarily disabled authentication check
  return <>{children}</>;
};

export default ProtectedRoute;
