import { PaymentStatus } from '../enums';

export interface Transaction {
  id: string;
  tenantPhone: string;
  landlordName: string;
  houseTitle: string;
  amountTotal: number;
  commissionAmount: number;
  payoutAmount: number;
  currency: string;
  paymentMethod: 'evc_plus' | 'zaad' | 'sahal' | 'card';
  paymentStatus: PaymentStatus | 'created' | 'processing' | 'successful' | 'cancelled' | 'expired' | 'refunded';
  failureReason?: string;
  requestTime: string;
  completedTime?: string;
  rentalObligationId: string;
  obligationType: 'Application' | 'RentPayment';
  telecomReference?: string;
  date: string;
  verified: boolean;
}
