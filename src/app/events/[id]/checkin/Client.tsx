"use client";

import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import jsQR from "jsqr";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function CheckinPageClient({ eventId }: { eventId: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSubmitCode = useCallback(
    async (code: string) => {
      setStatus("送信中...");
      try {
        const res = await fetch(`/api/events/${eventId}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("出席登録完了");
          setSnackOpen(true);
        } else {
          setStatus(body?.error ?? "エラー");
        }
      } catch (e) {
        console.error(e);
        setStatus("送信失敗");
      }
    },
    [eventId],
  );

  const startCamera = useCallback(async () => {
    setError(null);
    setStatus(null);
    setResult(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // start scanning loop
      if (!rafRef.current) rafRef.current = requestAnimationFrame(scan);
    } catch (e) {
      console.error(e);
      setError("カメラにアクセスできません");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }

    const w = (canvas.width = video.videoWidth || 300);
    const h = (canvas.height = video.videoHeight || 300);
    try {
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        setResult(code.data);
        stopCamera();
        handleSubmitCode(code.data);
        return;
      }
    } catch (e) {
      // ignore until video ready
    }
    rafRef.current = requestAnimationFrame(scan);
  }, [handleSubmitCode, stopCamera]);

  return (
    <Box>
      <Stack spacing={2}>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              width: 320,
              height: 320,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              background: "#000",
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
              }}
            />
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              style={{ position: "absolute", left: 0, top: 0 }}
            />

            {/* scanning frame */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 36,
                top: 36,
                width: 248,
                height: 248,
                borderRadius: 12,
                boxSizing: "border-box",
                border: "4px solid rgba(255,255,255,0.85)",
                pointerEvents: "none",
              }}
            />

            {/* hint text */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 8,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: 12 }}>
                中央の枠にQRを合わせてください
              </Typography>
            </div>
          </div>
        </Box>
        <Typography>読み取り結果: {result ?? "-"}</Typography>
        <Typography>{status}</Typography>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => {
              stopCamera();
              startCamera();
            }}
          >
            再試行
          </Button>
        </Stack>

        <Snackbar
          open={snackOpen}
          autoHideDuration={2500}
          onClose={() => setSnackOpen(false)}
        >
          <Alert
            onClose={() => setSnackOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            出席登録が完了しました
          </Alert>
        </Snackbar>
      </Stack>
    </Box>
  );
}
