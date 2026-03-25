import { headers } from "next/headers";
import { notFound, unauthorized } from "next/navigation";
import Atendee from "@/lib/atendee";
import { auth } from "@/lib/auth";
import Event from "@/lib/event";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) => {
  const { eventId } = await params;

  const jsonData = await request.json();

  // イベントが存在するか確認
  const event = await Event.findById(eventId);
  if (!event) {
    notFound();
  }

  // 定員オーバーの確認
  const attendeeCount = (await event.getAtendees()).length;
  if (event.capacity && attendeeCount >= event.capacity) {
    return new Response(
      JSON.stringify({
        error: {
          code: "capacity_full",
          message: "This event has reached its capacity.",
        },
      }),
      { status: 400 },
    );
  }

  // 参加者の登録
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      unauthorized();
    }
    const attendee = await event.addAtendee(session?.user.id!, jsonData.status);
    return new Response(JSON.stringify({ attendee }), { status: 201 });
  } catch {
    return new Response(
      JSON.stringify({
        error: { code: "internal_error", message: "Unknown error occurred." },
      }),
      { status: 500 },
    );
  }
};

export const DELETE = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) => {
  const { eventId } = await params;

  // イベントが存在するか確認
  const event = await Event.findById(eventId);
  if (!event) {
    notFound();
  }

  // 参加者の登録解除
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      unauthorized();
    }
    const atendenceData = await Atendee.findByUserIdAndEventId(
      session?.user?.id!,
      event.id,
    );
    if (!atendenceData) {
      return new Response(
        JSON.stringify({
          error: {
            code: "not_found",
            message: "Attendance data not found for the user.",
          },
        }),
        { status: 404 },
      );
    }
    await atendenceData.delete();
    return new Response(null, { status: 204 });
  } catch {
    return new Response(
      JSON.stringify({
        error: { code: "internal_error", message: "Unknown error occurred." },
      }),
      { status: 500 },
    );
  }
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) => {
  const { eventId } = await params;

  const jsonData = await request.json();

  // イベントが存在するか確認
  const event = await Event.findById(eventId);
  if (!event) {
    notFound();
  }

  // 参加者のステータス更新
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      unauthorized();
    }
    const atendenceData = await Atendee.findByUserIdAndEventId(
      session?.user?.id!,
      event.id,
    );
    if (!atendenceData) {
      return new Response(
        JSON.stringify({
          error: {
            code: "not_found",
            message: "Attendance data not found for the user.",
          },
        }),
        { status: 404 },
      );
    }
    atendenceData.status = jsonData.status;
    await atendenceData.update();
    return new Response(JSON.stringify({ attendee: atendenceData }), {
      status: 200,
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: { code: "internal_error", message: "Unknown error occurred." },
      }),
      { status: 500 },
    );
  }
};
