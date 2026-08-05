import { ApplicationStatus } from '../enums';

export interface Application {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  houseId: string;
  houseTitle: string;
  proposedStartDate: string;
  status: ApplicationStatus | 'rented';
  landlordFeedback?: string;
  createdAt: string;
  monthlyRent?: number;
  depositPaid?: number;
  monthsPaid?: number;
}
