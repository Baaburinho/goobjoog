import { ComplaintStatus } from '../enums';

export interface Complaint {
  id: string;
  reporterName: string;
  reporterPhone: string;
  title: string;
  details: string;
  houseTitle: string;
  status: ComplaintStatus;
  createdAt: string;
  resolutionNotes?: string;
}
