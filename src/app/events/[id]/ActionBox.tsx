"use client";
import { AtendeePlain, AtendeeStatus } from "@/lib/types/atendee";
import { EventPlain, EventStatus } from "@/lib/types/event";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  MenuItem,
  Select,
} from "@mui/material";
import { redirect } from "next/navigation";
import Link from "next/link";
import React from "react";
import { useState } from "react";

export default function ActionBox({
  event,
  isAdmin,
  atendenceData,
}: {
  event: EventPlain;
  isAdmin: boolean;
  atendenceData: AtendeePlain | null;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as AtendeeStatus;

    const res = await fetch(`/api/events/${event.id}/atendee`, {
      method: atendenceData ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      credentials: "include",
    });

    if (!res.ok) {
      redirect(`/events/${event.id}?error=参加登録に失敗しました`);
      return;
    }

    handleCloseDialog();

    redirect(`/events/${event.id}?success=参加登録が完了しました`);
  };

  const handleDeleteSubmit = async () => {
    const res = await fetch(`/api/events/${event.id}/atendee`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      redirect(`/events/${event.id}?error=参加登録の取り消しに失敗しました`);
      return;
    }

    handleCloseDialog();

    redirect(`/events/${event.id}?success=参加登録を取り消しました`);
  };

  const isEnabled = event.status === EventStatus.Enabled;
  const isRegistrationOpen = (() => {
    if (!event.registrationDeadline) {
      return true;
    }
    const jstDate = new Date(
      (event.registrationDeadline?.getTime() || 0) +
        9 * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000 -
        1,
    );
    const nowJst = new Date();
    nowJst.setHours(nowJst.getHours() + 9);
    if (event.status === EventStatus.Enabled && jstDate >= nowJst) {
      return true;
    }
    return false;
  })();

  const isEnded = (() => {
    const jstDate = new Date(event.date.getTime() + 9 * 60 * 60 * 1000);
    const nowJst = new Date();
    nowJst.setHours(nowJst.getHours() + 9);
    if (jstDate < nowJst) {
      return true;
    }
    return false;
  })();

  let isCantChangeBtn = false;

  const primaryButton = (() => {
    // 終わっているなら受付不可
    if (isEnded) {
      return (
        <Button variant="outlined" disabled sx={{ textTransform: "none" }}>
          受付不可
        </Button>
      );
    }

    // 公開中かつ登録締切内なら申し込む（未申込） or 確認・変更（申込済）
    if (isEnabled && isRegistrationOpen) {
      if (atendenceData) {
        return (
          <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={handleOpenDialog}
          >
            申し込み内容の確認・変更
          </Button>
        );
      }
      return (
        <Button
          variant="contained"
          sx={{ textTransform: "none" }}
          onClick={handleOpenDialog}
        >
          申し込む
        </Button>
      );
    }

    // 登録締切などで受付は閉じている場合
    if (atendenceData) {
      // 既に申し込み済みなら確認は表示するが編集不可にする
      isCantChangeBtn = true;
      return (
        <Button variant="contained" disabled sx={{ textTransform: "none" }}>
          申し込み内容の確認・変更
        </Button>
      );
    }

    // それ以外は受付不可
    return (
      <Button variant="outlined" disabled sx={{ textTransform: "none" }}>
        受付不可
      </Button>
    );
  })();

  return (
    <React.Fragment>
      <Box display="flex" gap={2} pt={2}>
        {primaryButton}
        {isAdmin && (
          <Button
            component={Link}
            href={`/events/${event.id}/edit`}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            イベントの編集
          </Button>
        )}
      </Box>
      {isCantChangeBtn && (
        <FormHelperText sx={{ mt: 1, ml: 1 }}>
          申し込み受付期間を過ぎています。変更は主催者までお申し付けください。
        </FormHelperText>
      )}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>参加登録</DialogTitle>
        <DialogContent>
          <DialogContentText>
            イベント「{event.title}」
            {atendenceData ? "の参加登録を変更しますか？" : "に参加しますか？"}
            <br />
            参加者ステータスを入力
            {atendenceData
              ? "するか、下の参加取り消しを行なってください。"
              : "してください。"}
          </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <Select
              fullWidth
              name="status"
              defaultValue={
                atendenceData ? atendenceData.status : AtendeeStatus.Attend
              }
              sx={{ mt: 2 }}
            >
              <MenuItem value={AtendeeStatus.Attend}>参加する</MenuItem>
              <MenuItem value={AtendeeStatus.Maybe}>おそらく参加する</MenuItem>
            </Select>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          {atendenceData && (
            <Button
              onClick={handleDeleteSubmit}
              variant="contained"
              color="error"
            >
              参加取り消し
            </Button>
          )}
          <Button type="submit" form="subscription-form" variant="contained">
            登録する
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
