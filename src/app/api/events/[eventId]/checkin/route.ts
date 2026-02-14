import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body as { code?: string };
    if (!code)
      return NextResponse.json({ error: "code required" }, { status: 400 });

    const { eventId } = await params;

    const codeRow = await prisma.atendeeCheckInCodes.findUnique({
      where: { id: code },
    });
    if (!codeRow || codeRow.eventId !== eventId) {
      return NextResponse.json({ error: "invalid code" }, { status: 400 });
    }
    if (codeRow.expiresAt < new Date()) {
      return NextResponse.json({ error: "code expired" }, { status: 400 });
    }

    const attendee = await prisma.eventAttendee.findFirst({
      where: { eventId, userId: session.user.id },
    });
    if (!attendee) {
      return NextResponse.json(
        { error: "not registered for event" },
        { status: 404 },
      );
    }

    if (!attendee.isAtended) {
      await prisma.eventAttendee.update({
        where: { id: attendee.id },
        data: { isAtended: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
