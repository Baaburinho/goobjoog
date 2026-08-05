export const AppRoutes = {
  Public: {
    Home: '/',
    Login: '/login',
    Register: '/register',
    ForgotPassword: '/forgot-password'
  },
  Tenant: {
    Dashboard: '/tenant',
    Houses: '/tenant/houses',
    Payments: '/tenant/payments',
    Profile: '/tenant/profile'
  },
  Homeowner: {
    Dashboard: '/homeowner',
    Houses: '/homeowner/houses',
    Payments: '/homeowner/payments',
    Profile: '/homeowner/profile'
  },
  Admin: {
    Dashboard: '/admin',
    Users: '/admin/users',
    Reports: '/admin/reports',
    Settings: '/admin/settings'
  },
  Accountant: {
    Dashboard: '/accountant',
    Payments: '/accountant/payments',
    Reports: '/accountant/reports'
  },
  Global: {
    Settings: '/settings',
    Notifications: '/notifications',
    Help: '/help',
    Privacy: '/privacy',
    Terms: '/terms'
  },
  System: {
    NotFound: '/404',
    AccessDenied: '/403',
    ServerError: '/500',
    SessionExpired: '/session-expired'
  }
};
