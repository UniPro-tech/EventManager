"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Event from "@/lib/event";
import { EventList } from "./EventList";

export default async function AttendedEventList() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;
  const events = userId ? await Event.findByAtendeeUserId(userId) : [];

  return <EventList events={events} />;
}
