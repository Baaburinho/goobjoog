import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Guards
import { GuestRoute } from './guards/GuestRoute';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleProtectedRoute } from './guards/RoleProtectedRoute';

// Layouts
import { GuestLayout } from '../shared/layouts/GuestLayout';
import { TenantLayout } from '../shared/layouts/TenantLayout';
import { HomeownerLayout, AccountantLayout, AdminLayout } from '../shared/layouts/OtherLayouts';

// System Pages
import { NotFoundPage } from '../shared/components/pages/NotFoundPage';
import { AccessDeniedPage } from '../shared/components/pages/AccessDeniedPage';
import { SessionExpiredPage } from '../shared/components/pages/SessionExpiredPage';

// We will progressively import the actual feature pages here.
// For now, they will just be placeholders to satisfy the route structure.
const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
    <h2 className="text-xl font-bold text-slate-800">{name}</h2>
    <p className="text-slate-500 mt-2">This feature is migrating to React Router.</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GuestRoute />,
    children: [
      {
        path: '',
        element: <GuestLayout />,
        children: [
          { path: '', element: <Navigate to="/login" replace /> },
          { path: 'login', element: <Placeholder name="Authentication Portal" /> }
        ]
      }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'tenant',
        element: <RoleProtectedRoute allowedRoles={['tenant']} />,
        children: [
          {
            path: '',
            element: <TenantLayout />,
            children: [
              { path: '', element: <Navigate to="/tenant/dashboard" replace /> },
              { path: 'dashboard', element: <Placeholder name="Tenant Dashboard" /> }
            ]
          }
        ]
      },
      {
        path: 'homeowner',
        element: <RoleProtectedRoute allowedRoles={['homeowner', 'landlord']} />,
        children: [
          {
            path: '',
            element: <HomeownerLayout />,
            children: [
              { path: '', element: <Navigate to="/homeowner/dashboard" replace /> },
              { path: 'dashboard', element: <Placeholder name="Homeowner Dashboard" /> }
            ]
          }
        ]
      },
      {
        path: 'accountant',
        element: <RoleProtectedRoute allowedRoles={['accountant']} />,
        children: [
          {
            path: '',
            element: <AccountantLayout />,
            children: [
              { path: '', element: <Navigate to="/accountant/dashboard" replace /> },
              { path: 'dashboard', element: <Placeholder name="Accountant Dashboard" /> }
            ]
          }
        ]
      },
      {
        path: 'admin',
        element: <RoleProtectedRoute allowedRoles={['administrator']} />,
        children: [
          {
            path: '',
            element: <AdminLayout />,
            children: [
              { path: '', element: <Navigate to="/admin/dashboard" replace /> },
              { path: 'dashboard', element: <Placeholder name="Admin Dashboard" /> }
            ]
          }
        ]
      }
    ]
  },
  // System Routes
  { path: '/403', element: <AccessDeniedPage /> },
  { path: '/session-expired', element: <SessionExpiredPage /> },
  { path: '*', element: <NotFoundPage /> }
]);
