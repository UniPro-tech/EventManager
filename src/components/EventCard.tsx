import Event from "@/lib/event";
import { EventStatus } from "@/lib/types/event";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Atendee from "@/lib/atendee";
import { AtendeeStatus } from "@/lib/types/atendee";
import Link from "next/link";

export default async function EventCard({
  event,
  isEditable,
}: {
  event: Event;
  isEditable?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  let plainAtendence = null;
  if (userId) {
    const atend = await Atendee.findByUserIdAndEventId(userId, event.id);
    plainAtendence = atend ? atend.toPlain() : null;
  }

  const registrationLabel = plainAtendence
    ? plainAtendence.status === AtendeeStatus.Attend
      ? "申し込み済み"
      : plainAtendence.status === AtendeeStatus.Maybe
        ? "参加検討中"
        : "申込済"
    : null;

  const registrationColor = plainAtendence
    ? plainAtendence.status === AtendeeStatus.Attend
      ? "success"
      : "info"
    : null;

  const truncate = (text?: string | null, max = 140) => {
    if (!text) return "";
    return text.length > max ? text.slice(0, max - 1) + "…" : text;
  };

  const TITLE_MAX = 60;
  const DESC_MAX = 160;
  const truncatedTitle = truncate(event.title, TITLE_MAX);
  const truncatedDesc = truncate(event.description || "", DESC_MAX);

  return (
    <Card key={event.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1}
        >
          <Tooltip
            title={event.title || ""}
            disableHoverListener={
              !event.title || event.title.length <= TITLE_MAX
            }
          >
            <Link
              href={`/events/${event.id}`}
              style={{ textDecoration: "none" }}
            >
              <Typography
                variant="h6"
                component="h3"
                noWrap
                sx={{
                  maxWidth: { xs: "100%", sm: "60%" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {truncatedTitle}
              </Typography>
            </Link>
          </Tooltip>

          <Box sx={{ mt: { xs: 1, sm: 0 } }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
            >
              <Chip
                size="small"
                label={
                  event.status === EventStatus.Enabled
                    ? event.isEnded
                      ? "終了"
                      : event.isRegistrationOpen
                        ? "受付中"
                        : "受付終了"
                    : event.status === EventStatus.Blocked
                      ? "中止"
                      : "下書き"
                }
                color={
                  event.status === EventStatus.Enabled
                    ? event.isEnded
                      ? "default"
                      : event.isRegistrationOpen
                        ? "primary"
                        : "warning"
                    : event.status === EventStatus.Blocked
                      ? "error"
                      : "default"
                }
                variant={
                  event.status === EventStatus.Enabled ? "filled" : "outlined"
                }
              />

              {registrationLabel && (
                <Chip
                  size="small"
                  label={registrationLabel}
                  color={registrationColor as any}
                />
              )}
            </Stack>
          </Box>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 2 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mt: 1 }}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
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
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {event.location}
              </Typography>
            </Box>
          )}

          {event.capacity != null && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <PeopleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                定員: {event.capacity}
              </Typography>
            </Box>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          登録締切:{" "}
          {event.registrationDeadline
            ? event.registrationDeadline.toLocaleDateString()
            : "当日まで可"}
        </Typography>

        <Tooltip
          title={event.description || ""}
          disableHoverListener={
            !event.description || event.description.length <= DESC_MAX
          }
        >
          <Typography
            variant="body1"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: { xs: 3, sm: "none" },
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {truncatedDesc}
          </Typography>
        </Tooltip>

        <Box
          pt={2}
          display="flex"
          gap={1}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          {isEditable && (
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: "none", width: { xs: "100%", sm: "auto" } }}
              href={`/events/${event.id}/edit`}
            >
              編集
            </Button>
          )}

          <Button
            variant="contained"
            size="small"
            sx={{
              ml: { xs: 0, sm: "auto" },
              textTransform: "none",
              width: { xs: "100%", sm: "auto" },
            }}
            href={`/events/${event.id}`}
          >
            詳細を見る
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
