import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Event from "@/lib/event";
import { EventStatus } from "@/lib/types/event";

export const metadata = {
  title: "新しいイベントの作成",
};

export default async function NewEventPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) forbidden();
  const action = async (formData: FormData) => {
    "use server";
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      registrationDeadline,
      location,
      capacity,
      status,
    } = Object.fromEntries(formData) as Record<string, string>;
    const eventData = {
      title,
      description,
      date: new Date(date),
      startTime: startTime ? new Date(`${date}T${startTime}`) : undefined,
      endTime: endTime ? new Date(`${date}T${endTime}`) : undefined,
      registrationDeadline: registrationDeadline
        ? new Date(`${registrationDeadline}T23:59:59`)
        : undefined,
      location,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      status: status as EventStatus,
    };
    let event;
    try {
      event = await Event.create(eventData);
    } catch (error) {
      return;
    }
    const msg = encodeURIComponent("イベントが作成されました");
    redirect(`/events/${event.id}?success=${msg}`);
  };

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
          新しいイベントの作成
        </Typography>
        <Typography>新規イベントを作成します。</Typography>
        <form
          action={action}
          className="w-full max-w-2xl flex flex-col gap-4 mt-4"
        >
          <TextField
            name="title"
            label="イベント名"
            variant="outlined"
            fullWidth
            required
          />
          <TextField
            name="description"
            label="イベントの説明"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
          />

          <TextField
            name="date"
            label="開催日"
            type="date"
            variant="outlined"
            fullWidth
            required
          />

          <TextField
            name="startTime"
            label="開始時間"
            type="time"
            variant="outlined"
            fullWidth
          />
          <TextField
            name="endTime"
            label="終了時間"
            type="time"
            variant="outlined"
            fullWidth
          />

          <TextField
            name="registrationDeadline"
            label="登録締切日"
            type="date"
            variant="outlined"
            fullWidth
          />

          <TextField
            name="location"
            label="場所"
            variant="outlined"
            fullWidth
          />
          <TextField
            name="capacity"
            label="定員"
            type="number"
            variant="outlined"
            fullWidth
          />

          <Select
            name="status"
            variant="outlined"
            fullWidth
            required
            defaultValue={EventStatus.Draft}
          >
            <MenuItem value={EventStatus.Enabled}>公開</MenuItem>
            <MenuItem value={EventStatus.Draft}>下書き</MenuItem>
            <MenuItem value={EventStatus.Blocked}>中止</MenuItem>
          </Select>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ textTransform: "none" }}
          >
            イベントを作成する
          </Button>
        </form>
      </Stack>
    </Box>
  );
}
