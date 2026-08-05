import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const GuestRoute: React.FC = () => {
  const { currentUser } = useAuth();

  if (currentUser) {
    // If logged in, redirect to their respective dashboard
    if (currentUser.roles.includes('administrator')) return <Navigate to="/admin" replace />;
    if (currentUser.roles.includes('accountant')) return <Navigate to="/accountant" replace />;
    if (currentUser.roles.includes('homeowner')) return <Navigate to="/homeowner" replace />;
    return <Navigate to="/tenant" replace />;
  }

  return <Outlet />;
};
