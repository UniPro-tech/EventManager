interface EventPlain {
  id?: string;
  title: string;
  description?: string | null;
  date: Date;
  startAt?: Date | null;
  endAt?: Date | null;
  registrationDeadline?: Date | null;
  capacity?: number | null;
  location?: string | null;
  status: EventStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

enum EventStatus {
  Draft = "DRAFT",
  Enabled = "ENABLED",
  Blocked = "BLOCKED",
}

export { EventStatus, type EventPlain };
