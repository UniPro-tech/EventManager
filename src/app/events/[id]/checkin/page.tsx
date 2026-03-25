import { Box, Button, Stack, Typography } from "@mui/material";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "react-qr-code";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CheckinPageClient from "./Client";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();
  if (isAdmin) {
    const existingCode = await prisma.atendeeCheckInCodes.findUnique({
      where: { eventId: id },
    });
    let code = existingCode?.id;
    if (!existingCode || existingCode.expiresAt < new Date()) {
      await prisma.atendeeCheckInCodes.deleteMany({ where: { eventId: id } });
      const newCode = await prisma.atendeeCheckInCodes.create({
        data: {
          eventId: id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        },
      });
      code = newCode.id;
    }
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 920 },
          mx: "auto",
          px: { xs: 2, md: 0 },
        }}
      >
        <Stack spacing={2} padding={2}>
          <Typography variant="h4" component="h1">
            イベント出席登録
          </Typography>
          <QRCode value={code || ""} size={256} />
          <form
            action={async (formData: FormData) => {
              "use server";
              const eventId = String(formData.get("eventId"));
              await prisma.atendeeCheckInCodes.deleteMany({
                where: { eventId },
              });
              await prisma.atendeeCheckInCodes.create({
                data: {
                  eventId,
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                },
              });
              try {
                revalidatePath(`/events/${eventId}/checkin`);
              } catch (e) {
                console.warn("revalidatePath failed", e);
              }
            }}
          >
            <input name="eventId" type="hidden" value={id} />
            <Button type="submit">再生成</Button>
          </form>
        </Stack>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: 920 },
          mx: "auto",
          px: { xs: 2, md: 0 },
        }}
      >
        <Stack spacing={2} padding={2}>
          <Typography variant="h4" component="h1">
            イベント出席登録
          </Typography>
          <Typography variant="body1">
            QRコードを読み取り、出席登録してください。
          </Typography>
          <CheckinPageClient eventId={id} />
        </Stack>
      </Box>
    );
  }
}
