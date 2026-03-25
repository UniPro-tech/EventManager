import Atendee from "@/lib/atendee";

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ atendeeId: string }> },
) => {
  const atendeeId = (await params).atendeeId;

  const atendee = await Atendee.findById(atendeeId);
  if (!atendee) {
    return new Response(JSON.stringify({ message: "Atendee not found" }), {
      status: 404,
    });
  }
  await atendee.delete();

  return new Response(null, { status: 204 });
};
