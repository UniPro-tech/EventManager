import AttendedEventList from "@/components/AtendedEventList";
import { Stack, Typography } from "@mui/material";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード - UniPro Event Manager",
};

export default function Dashboard() {
  return (
    <Stack component={"main"} spacing={4} padding={{ xs: 2, md: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        ようこそ！
      </Typography>
      <Typography variant="body1" gutterBottom>
        ここでは、デジタル創作サークルUniProjectにおけるさまざまなイベントへ参加登録等を行うことができます。
      </Typography>
      <Stack
        alignContent={"start"}
        sx={{ maxWidth: { xs: "100%", md: 920 } }}
        spacing={2}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          参加登録済みのイベント
        </Typography>
        <AttendedEventList />
      </Stack>
    </Stack>
  );
}
