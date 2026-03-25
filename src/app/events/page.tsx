import { Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import AllEventList from "@/components/AllEventList";
import TemporarySnackProvider from "@/components/TemporarySnackProvider";

export const metadata: Metadata = {
  title: "イベント一覧",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const snack = [];
  if (error) {
    snack.push({ message: error, variant: "error" as const });
  }
  if (success) {
    snack.push({ message: success, variant: "success" as const });
  }
  return (
    <Stack
      component={"main"}
      spacing={{ xs: 2, md: 4 }}
      sx={{ p: { xs: 2, md: 4 } }}
    >
      <TemporarySnackProvider snacks={snack} />
      <Typography variant="h4">イベント一覧</Typography>
      <Typography>利用可能なイベント一覧です。</Typography>
      <AllEventList />
    </Stack>
  );
}
