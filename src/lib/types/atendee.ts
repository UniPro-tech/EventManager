export interface AtendeePlain {
  id?: string;
  userId: string;
  eventId: string;
  status: AtendeeStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AtendeeStatus {
  Attend = "ATTEND",
  Maybe = "MAYBE",
}
