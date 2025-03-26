
import React from 'react';
import { useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Authentication is now disabled - we simply return the children
  return <>{children}</>;
};

export default ProtectedRoute;
