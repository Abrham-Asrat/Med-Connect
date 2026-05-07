export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Completed = 'completed', // maps to closed usually or legacy
  Cancelled = 'cancelled',
  Active = 'active',
  FollowUp = 'follow_up',
  Closed = 'closed'
}