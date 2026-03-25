import { Box, Button, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { headers } from "next/headers";
import AttendedEventList from "@/components/AtendedEventList";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "参加登録済みイベント",
};

export default async function AttendedEventsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  return (
    <Stack spacing={{ xs: 2, md: 4 }} sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1">
        参加登録済みイベント
      </Typography>
      <Typography>
        ここに参加登録しているイベントの一覧が表示されます。
      </Typography>
      <Box>
        {isAdmin && (
          <Button variant="outlined" href="/events/new">
            イベントを作成する
          </Button>
        )}
      </Box>
      <AttendedEventList />
    </Stack>
  );
}
