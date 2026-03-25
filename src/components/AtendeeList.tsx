import { headers } from "next/headers";
import type Atendee from "@/lib/atendee";
import { auth } from "@/lib/auth";
import Event from "@/lib/event";
import { AtendeeStatus } from "@/lib/types/atendee";
import EventAtendeeDataGridClient from "./AtendeeDataGridClient";

export default async function EventAtendeeList({
  atendees,
}: {
  atendees: Atendee[];
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user?.role === "admin";

  try {
    const uniqueUserIds = [...new Set(atendees.map((a) => a.userId))];
    const uniqueEventIds = [...new Set(atendees.map((a) => a.eventId))];

    const hdrs = await headers();

    const users = await Promise.all(
      uniqueUserIds.map(async (id) => {
        if (!isAdmin) return null; // only admins may fetch full user data
        try {
          return await auth.api.getUser({ headers: hdrs, query: { id } });
        } catch (e) {
          console.error(`failed to fetch user ${id}`, e);
          return null;
        }
      }),
    );

    const events = await Promise.all(
      uniqueEventIds.map(async (id) => {
        try {
          return await Event.findById(id);
        } catch (e) {
          console.error(`failed to fetch event ${id}`, e);
          return null;
        }
      }),
    );

    const userMap = new Map(users.map((u) => [u?.id, u]));
    const eventMap = new Map(events.map((e) => [e?.id, e]));

    const rows = atendees.map((atendee) => {
      const user = userMap.get(atendee.userId);
      const event = eventMap.get(atendee.eventId);
      return {
        id: atendee.id!,
        userName: user ? user.name : "不明なユーザー",
        eventId: atendee.eventId,
        eventName: event ? event.title : "不明なイベント",
        status:
          atendee.status === AtendeeStatus.Attend
            ? "参加"
            : atendee.status === AtendeeStatus.Maybe
              ? "おそらく参加"
              : "不明なステータス",
        createdAt: new Date(atendee.createdAt!).toLocaleString(),
        updatedAt: new Date(atendee.updatedAt!).toLocaleString(),
      };
    });
    return <EventAtendeeDataGridClient atendees={rows} isAdmin={isAdmin} />;
  } catch (error) {
    console.error("AtendeeList render error:", error);
    return (
      <div>
        <p>出席者リストの取得中にエラーが発生しました。</p>
      </div>
    );
  }
}
