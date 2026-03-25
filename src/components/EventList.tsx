import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { auth } from "@/lib/auth";
import type Event from "@/lib/event";
import EventCard from "./EventCard";

export async function EventList({ events }: { events: Event[] }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: 920 },
        mx: "auto",
        px: { xs: 0, md: 0 },
      }}
    >
      <Stack spacing={{ xs: 1, md: 2 }}>
        {events.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}
          >
            <Typography variant="h6">
              利用可能なイベントが見つかりません。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              現在表示できるイベントはありません。
            </Typography>
            {isAdmin && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    width: { xs: "100%", md: "auto" },
                  }}
                  fullWidth
                  href="/events/new"
                >
                  イベントを作成
                </Button>
              </Box>
            )}
          </Paper>
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} isEditable={isAdmin} />
          ))
        )}
      </Stack>
    </Box>
  );
}
