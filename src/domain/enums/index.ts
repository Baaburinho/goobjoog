export const UserRole = {
  Tenant: 'tenant',
  Homeowner: 'homeowner',
  Landlord: 'landlord',
  Administrator: 'administrator'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const HouseStatus = {
  Available: 'available',
  Rented: 'rented',
  Maintenance: 'maintenance'
} as const;
export type HouseStatus = typeof HouseStatus[keyof typeof HouseStatus];

export const PaymentStatus = {
  Completed: 'completed',
  Pending: 'pending',
  Failed: 'failed'
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const ApplicationStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected'
} as const;
export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const NotificationType = {
  Payment: 'payment',
  Application: 'application',
  Maintenance: 'maintenance',
  System: 'system'
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const ComplaintStatus = {
  Open: 'open',
  InProgress: 'in_progress',
  Resolved: 'resolved'
} as const;
export type ComplaintStatus = typeof ComplaintStatus[keyof typeof ComplaintStatus];

export const TourStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled'
} as const;
export type TourStatus = typeof TourStatus[keyof typeof TourStatus];

