
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Temporarily bypass authentication checks
  return <>{children}</>;
};

export default ProtectedRoute;
