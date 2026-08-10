export interface Transaction {
  id: string;
  tenantPhone: string;
  landlordName: string;
  houseTitle: string;
  amountTotal: number;
  commissionAmount?: number;
  payoutAmount?: number;
  currency?: string;
  paymentMethod?: string;
  paymentStatus: string;
  failureReason?: string;
  date?: string;
  requestTime?: string;
  completedTime?: string;
  rentalObligationId?: string;
  obligationType?: string;
  telecomReference?: string;
  verified?: boolean;
}
