"use server";
import Event from "@/lib/event";
import { EventList } from "./EventList";

export default async function AttendedEventList() {
  const events = await Event.findAll();

  return <EventList events={events} />;
}
