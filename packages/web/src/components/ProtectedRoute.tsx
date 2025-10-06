import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('jwt');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
