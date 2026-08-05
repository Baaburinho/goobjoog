export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress: string;
}
