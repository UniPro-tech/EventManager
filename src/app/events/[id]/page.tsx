"use server";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { headers } from "next/headers";
import { forbidden, notFound, unauthorized } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TemporarySnackProvider from "@/components/TemporarySnackProvider";
import Atendee from "@/lib/atendee";
import { auth } from "@/lib/auth";
import Event from "@/lib/event";
import { AtendeeStatus } from "@/lib/types/atendee";
import { EventStatus } from "@/lib/types/event";
import ActionBox from "./ActionBox";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  // uuid check
  if (
    !(await params).id.match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    )
  ) {
    notFound();
  }

  const event = await Event.findById((await params).id);
  if (!event) notFound();
  return {
    title: `${event.title}`,
  };
};

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}) {
  const { id } = await params;
  // uuid check
  if (
    !id.match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    )
  ) {
    notFound();
  }
  const { error, success } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";

  const event = await Event.findById(id);
  if (!event) notFound();
  if (event.status === EventStatus.Draft && !isAdmin) return forbidden();

  if (!session?.user) unauthorized();

  const atendenceData = await Atendee.findByUserIdAndEventId(
    session.user.id,
    event.id,
  );

  const plainAtendence = atendenceData ? atendenceData.toPlain() : null;

  const registrationLabel = plainAtendence
    ? plainAtendence.status === AtendeeStatus.Attend
      ? "申し込み済み"
      : plainAtendence.status === AtendeeStatus.Maybe
        ? "おそらく参加"
        : "申込済"
    : null;

  const registrationColor = plainAtendence
    ? plainAtendence.status === AtendeeStatus.Attend
      ? "success"
      : "info"
    : null;

  const plainEvent = event.toPlain();

  const statusLabel =
    event.status === EventStatus.Enabled
      ? event.isEnded
        ? "終了"
        : event.isRegistrationOpen
          ? "受付中"
          : "受付終了"
      : event.status === EventStatus.Blocked
        ? "中止"
        : "下書き";

  const statusColor =
    event.status === EventStatus.Enabled
      ? event.isEnded
        ? "default"
        : event.isRegistrationOpen
          ? "primary"
          : "warning"
      : event.status === EventStatus.Blocked
        ? "error"
        : "default";

  const snack = [];
  if (error) {
    snack.push({ message: error, variant: "error" as const });
  }
  if (success) {
    snack.push({ message: success, variant: "success" as const });
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
      <TemporarySnackProvider snacks={snack} />
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              gap={1}
            >
              <Box>
                <Typography variant="h4" component="h1">
                  {event.title}
                </Typography>
              </Box>

              <Box sx={{ mt: { xs: 1, md: 0 } }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Chip label={statusLabel} color={statusColor as any} />
                  {registrationLabel && (
                    <Chip
                      size="small"
                      label={registrationLabel}
                      color={
                        (registrationColor as "info" | "success" | null) ??
                        undefined
                      }
                    />
                  )}
                </Stack>
              </Box>
            </Box>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <ScheduleIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {event.date.toLocaleDateString()}
                  {event.startAt
                    ? ` ${event.startAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}
                  {event.endAt
                    ? ` - ${event.endAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}
                </Typography>
              </Box>

              {event.location && (
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {event.location}
                  </Typography>
                </Box>
              )}

              {event.capacity != null && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PeopleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    定員: {event.capacity}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              登録締切:{" "}
              {event.registrationDeadline
                ? event.registrationDeadline.toLocaleDateString()
                : "当日まで可"}
            </Typography>

            <Divider />

            <Typography variant="body1">
              <div className="markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {event.description}
                </ReactMarkdown>
              </div>
            </Typography>
          </Stack>
          <ActionBox
            event={plainEvent}
            isAdmin={isAdmin}
            atendenceData={plainAtendence}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
