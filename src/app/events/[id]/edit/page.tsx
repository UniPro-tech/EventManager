"use server";
import TemporarySnackProvider from "@/components/TemporarySnackProvider";
import { auth } from "@/lib/auth";
import Event from "@/lib/event";
import { EventStatus } from "@/lib/types/event";
import {
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { forbidden } from "next/navigation";

export const generateMetadata = async () => {
  return {
    title: "イベント編集 - UniPro Event Manager",
  } as Metadata;
};

export default async function EventEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}) {
  const { error, success } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) forbidden();

  const { id } = await params;
  if (
    !id.match(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    )
  ) {
    notFound();
  }
  const event = await Event.findById(id);
  if (!event) forbidden();

  const action = async (formData: FormData) => {
    "use server";
    const {
      id,
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

    const existing = await Event.findById(id);
    if (!existing) throw new Error("Event not found");

    existing.title = title;
    existing.description = description || undefined;
    existing.date = new Date(date);
    existing.startAt = startTime ? new Date(`${date}T${startTime}`) : undefined;
    existing.endAt = endTime ? new Date(`${date}T${endTime}`) : undefined;
    existing.registrationDeadline = registrationDeadline
      ? new Date(registrationDeadline)
      : undefined;
    existing.location = location || undefined;
    existing.capacity = capacity ? parseInt(capacity, 10) : undefined;
    existing.status = status as EventStatus;

    await existing.update();
    const msg = encodeURIComponent("イベントが更新されました");
    redirect(`/events/${existing.id}?success=${msg}`);
  };

  const hundleDelete = async (e: FormData) => {
    "use server";
    const existing = await Event.findById(event.id);
    if (!existing) throw new Error("Event not found");
    await existing.delete();
    const msg = encodeURIComponent("イベントが削除されました");
    redirect(`/events?success=${msg}`);
  };

  const formatDate = (d?: Date | null) =>
    d ? d.toISOString().slice(0, 10) : "";
  const formatTime = (d?: Date | null) =>
    d ? d.toISOString().slice(11, 16) : "";

  const snack = [
    ...(error
      ? [
          {
            message: error,
            variant: "error" as const,
          },
        ]
      : []),
    ...(success
      ? [
          {
            message: success,
            variant: "success" as const,
          },
        ]
      : []),
  ];

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
      <Stack spacing={2} padding={2}>
        <Typography variant="h4" component="h1">
          イベントを編集
        </Typography>

        <form
          action={action}
          className="w-full max-w-2xl flex flex-col gap-4 mt-4"
        >
          <input type="hidden" name="id" value={event.id} />

          <TextField
            name="title"
            label="イベント名"
            variant="outlined"
            fullWidth
            defaultValue={event.title}
            required
          />

          <TextField
            name="description"
            label="イベントの説明"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            defaultValue={event.description || ""}
          />

          <TextField
            name="date"
            label="開催日"
            type="date"
            variant="outlined"
            fullWidth
            required
            defaultValue={formatDate(event.date)}
          />

          <TextField
            name="startTime"
            label="開始時間"
            type="time"
            variant="outlined"
            fullWidth
            defaultValue={formatTime(event.startAt)}
          />

          <TextField
            name="endTime"
            label="終了時間"
            type="time"
            variant="outlined"
            fullWidth
            defaultValue={formatTime(event.endAt)}
          />

          <TextField
            name="registrationDeadline"
            label="登録締切日"
            type="date"
            variant="outlined"
            fullWidth
            defaultValue={formatDate(event.registrationDeadline)}
          />

          <TextField
            name="location"
            label="場所"
            variant="outlined"
            fullWidth
            defaultValue={event.location || ""}
          />

          <TextField
            name="capacity"
            label="定員"
            type="number"
            variant="outlined"
            fullWidth
            defaultValue={event.capacity != null ? String(event.capacity) : ""}
          />

          <Select
            name="status"
            variant="outlined"
            fullWidth
            defaultValue={event.status}
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
            更新する
          </Button>
        </form>
        <form
          action={hundleDelete}
          className="w-full max-w-2xl flex flex-col gap-4 mt-4"
        >
          <Button
            variant="outlined"
            color="error"
            sx={{ textTransform: "none" }}
            type="submit"
            fullWidth
          >
            削除する
          </Button>
        </form>
      </Stack>
    </Box>
  );
}
