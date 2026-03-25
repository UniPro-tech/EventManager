import { Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import EventAtendeeList from "@/components/AtendeeList";
import Atendee from "@/lib/atendee";
import Event from "@/lib/event";

export default async function EventAtendeeListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const eventId = (await params).id;

  const event = await Event.findById(eventId);
  if (!event) notFound();

  const atendees = await Atendee.findByEventId(eventId);
  return (
    <Stack spacing={2}>
      <Typography variant="h4">「{event.title}」参加者一覧</Typography>
      <EventAtendeeList atendees={atendees} />
    </Stack>
  );
}
