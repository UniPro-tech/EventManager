import { Box, Button, Stack, Typography } from "@mui/material";
import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import ManageEventList from "@/components/ManageEventList";
import { auth } from "@/lib/auth";

export const generateMetadata = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    forbidden();
  }
  return {
    title: "主催のイベント",
  };
};

export default async function HostedEventsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    forbidden();
  }
  return (
    <Stack spacing={{ xs: 2, md: 4 }} sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" component="h1">
        主催のイベント
      </Typography>
      <Typography>ここに主催しているイベントの一覧が表示されます。</Typography>
      <Box>
        <Button variant="outlined" href="/events/new">
          イベントを作成する
        </Button>
      </Box>
      <ManageEventList />
    </Stack>
  );
}
