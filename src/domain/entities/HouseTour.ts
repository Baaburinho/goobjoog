import type { TourStatus } from '../enums';

export interface HouseTour {
  id: string;
  houseId: string;
  houseTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  landlordId: string;
  tourDate: string;
  tourTimeSlot: 'morning' | 'afternoon' | 'evening';
  tourType: 'in_person' | 'video_call';
  status: TourStatus | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}
