"use server";
import Event from "@/lib/event";
import { EventStatus } from "@/lib/types/event";
import { EventList } from "./EventList";

export default async function AllEventList() {
  const events = await Event.findAll({
    status: [EventStatus.Blocked, EventStatus.Enabled],
  });

  return <EventList events={events} />;
}
