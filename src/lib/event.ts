import Atendee from "./atendee";
import { AtendeeStatus } from "./types/atendee";
import prisma from "./prisma";
import { EventPlain, EventStatus } from "./types/event";

export default class Event {
  id: string;
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

  get isEnded() {
    const jstDate = new Date(this.date.getTime() + 9 * 60 * 60 * 1000);
    const nowJst = new Date();
    nowJst.setHours(nowJst.getHours() + 9);
    if (jstDate < nowJst) {
      return true;
    }
    return false;
  }
  get isRegistrationOpen() {
    if (!this.registrationDeadline) {
      return true;
    }
    const jstDate = new Date(
      (this.registrationDeadline?.getTime() || 0) +
        9 * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000 -
        1,
    );
    const nowJst = new Date();
    nowJst.setHours(nowJst.getHours() + 9);
    if (this.status === EventStatus.Enabled && jstDate >= nowJst) {
      return true;
    }
    return false;
  }

  constructor(data: EventPlain) {
    if (!data.id) {
      throw new Error("Event ID is required");
    }
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.registrationDeadline = data.registrationDeadline;
    this.startAt = data.startAt;
    this.endAt = data.endAt;
    this.capacity = data.capacity;
    this.location = data.location;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async create(data: EventPlain) {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startAt,
        endTime: data.endAt,
        registrationDeadline: data.registrationDeadline,
        capacity: data.capacity,
        location: data.location,
        status: data.status as EventStatus,
      },
    });
    return new Event({
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      date: event.date,
      startAt: event.startTime || undefined,
      endAt: event.endTime || undefined,
      registrationDeadline: event.registrationDeadline || undefined,
      capacity: event.capacity || undefined,
      location: event.location || undefined,
      status: event.status as EventStatus,
      createdAt: event.createdAt || undefined,
      updatedAt: event.updatedAt || undefined,
    });
  }

  async update() {
    await prisma.event.update({
      where: { id: this.id },
      data: {
        title: this.title,
        description: this.description,
        date: this.date,
        startTime: this.startAt,
        endTime: this.endAt,
        registrationDeadline: this.registrationDeadline,
        capacity: this.capacity,
        location: this.location,
        status: this.status,
      },
    });

    return;
  }

  async cancel() {
    await prisma.event.update({
      where: { id: this.id },
      data: { status: EventStatus.Blocked },
    });

    return;
  }

  async delete() {
    await prisma.event.delete({
      where: { id: this.id },
    });

    return;
  }

  async enable() {
    await prisma.event.update({
      where: { id: this.id },
      data: { status: EventStatus.Enabled },
    });

    return;
  }

  static async findById(id: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return null;
    }

    return new Event({
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      date: event.date,
      startAt: event.startTime || undefined,
      endAt: event.endTime || undefined,
      registrationDeadline: event.registrationDeadline || undefined,
      capacity: event.capacity || undefined,
      location: event.location || undefined,
      status: event.status as EventStatus,
      createdAt: event.createdAt || undefined,
      updatedAt: event.updatedAt || undefined,
    });
  }

  static async findAll({ status }: { status?: EventStatus[] } = {}): Promise<
    Event[]
  > {
    if (status) {
      const events = await prisma.event.findMany({
        where: { status: { in: status } },
      });

      return events.map(
        (event) =>
          new Event({
            id: event.id,
            title: event.title,
            description: event.description || undefined,
            date: event.date,
            startAt: event.startTime || undefined,
            endAt: event.endTime || undefined,
            registrationDeadline: event.registrationDeadline || undefined,
            capacity: event.capacity || undefined,
            location: event.location || undefined,
            status: event.status as EventStatus,
            createdAt: event.createdAt || undefined,
            updatedAt: event.updatedAt || undefined,
          }),
      );
    }

    const events = await prisma.event.findMany();

    return events.map(
      (event) =>
        new Event({
          id: event.id,
          title: event.title,
          description: event.description || undefined,
          date: event.date,
          startAt: event.startTime || undefined,
          endAt: event.endTime || undefined,
          registrationDeadline: event.registrationDeadline || undefined,
          capacity: event.capacity || undefined,
          location: event.location || undefined,
          status: event.status as EventStatus,
          createdAt: event.createdAt || undefined,
          updatedAt: event.updatedAt || undefined,
        }),
    );
  }

  static async findByAtendeeUserId(
    userId: string,
    {
      status,
      atendeeStatuses = [AtendeeStatus.Attend, AtendeeStatus.Maybe],
    }: { status?: EventStatus[]; atendeeStatuses?: AtendeeStatus[] } = {},
  ): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: {
        ...(status ? { status: { in: status } } : {}),
        participants: {
          some: {
            userId,
            status: { in: atendeeStatuses },
          },
        },
      },
    });

    return events.map(
      (event) =>
        new Event({
          id: event.id,
          title: event.title,
          description: event.description || undefined,
          date: event.date,
          startAt: event.startTime || undefined,
          endAt: event.endTime || undefined,
          registrationDeadline: event.registrationDeadline || undefined,
          capacity: event.capacity || undefined,
          location: event.location || undefined,
          status: event.status as EventStatus,
          createdAt: event.createdAt || undefined,
          updatedAt: event.updatedAt || undefined,
        }),
    );
  }

  async addAtendee(
    userId: string,
    status: AtendeeStatus = AtendeeStatus.Attend,
  ) {
    Atendee.create({ eventId: this.id, userId, status });
  }

  async getAtendees(): Promise<Atendee[]> {
    return Atendee.findByEventId(this.id);
  }

  toPlain(): EventPlain {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date,
      startAt: this.startAt,
      endAt: this.endAt,
      registrationDeadline: this.registrationDeadline,
      capacity: this.capacity,
      location: this.location,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
