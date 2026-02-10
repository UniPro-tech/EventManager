"use server";
import Event from "@/lib/event";
import { auth } from "@/lib/auth";
import { EventList } from "./EventList";
import { headers } from "next/headers";

export default async function AttendedEventList() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;
  const events = userId ? await Event.findByAtendeeUserId(userId) : [];

  return <EventList events={events} />;
}
