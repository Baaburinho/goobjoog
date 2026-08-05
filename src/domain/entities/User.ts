import { UserRole } from '../enums';

export interface UserProfile {
  id: string;
  fullName: string;
  roles: UserRole[];
  upgradeStatus?: 'none' | 'pending' | 'approved';
  phone: string;
  email: string;
  isVerified: boolean;
  username: string;
  password?: string; // stored for mock authentication checks
}
