import prisma from "./prisma";
import { AtendeeStatus, AtendeePlain } from "./types/atendee";

export default class Atendee {
  id!: string;
  userId: string;
  eventId: string;
  status: AtendeeStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: AtendeePlain) {
    this.id = data.id!;
    this.userId = data.userId;
    this.eventId = data.eventId;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async create(data: AtendeePlain): Promise<Atendee> {
    // Simulate API call to create an atendee
    const atendeeData = await prisma.eventAttendee.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        status: data.status,
      },
    });

    return new Atendee({
      id: atendeeData.id,
      userId: atendeeData.userId,
      eventId: atendeeData.eventId,
      status: atendeeData.status as AtendeeStatus,
      createdAt: atendeeData.createdAt,
      updatedAt: atendeeData.updatedAt,
    });
  }

  async update(): Promise<void> {
    await prisma.eventAttendee.update({
      where: { id: this.id },
      data: {
        status: this.status,
      },
    });
  }

  async delete(): Promise<void> {
    await prisma.eventAttendee.delete({
      where: { id: this.id },
    });
  }

  static async findByEventId(eventId: string): Promise<Atendee[]> {
    const atendeeDatas = await prisma.eventAttendee.findMany({
      where: { eventId },
    });
    return atendeeDatas.map(
      (data) =>
        new Atendee({
          id: data.id,
          userId: data.userId,
          eventId: data.eventId,
          status: data.status as AtendeeStatus,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  static async findByUserIdAndEventId(
    userId: string,
    eventId: string,
  ): Promise<Atendee | null> {
    const atendeeData = await prisma.eventAttendee.findFirst({
      where: { userId, eventId },
    });
    if (!atendeeData) return null;
    return new Atendee({
      id: atendeeData.id,
      userId: atendeeData.userId,
      eventId: atendeeData.eventId,
      status: atendeeData.status as AtendeeStatus,
      createdAt: atendeeData.createdAt,
      updatedAt: atendeeData.updatedAt,
    });
  }

  toPlain(): AtendeePlain {
    return {
      id: this.id,
      userId: this.userId,
      eventId: this.eventId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
