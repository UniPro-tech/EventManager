"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CheckinPageClient({ eventId }: { eventId: string }) {
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const router = useRouter();
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          router.push(`/events/${eventId}/checkin/success`);
        } else {
          setStatus(body?.error ?? "エラー");
        }
      } catch (e) {
        console.error(e);
        setStatus("送信失敗");
      }
    },
    [eventId, router],
  );

  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // ignore stop errors
      }
      try {
        html5QrCodeRef.current.clear();
      } catch {
        // ignore clear errors
      }
      html5QrCodeRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setStatus(null);
    setResult(null);
    if (!scannerRef.current) {
      setError("カメラ初期化に失敗しました");
      return;
    }
    const elementId = scannerRef.current.id;
    try {
      html5QrCodeRef.current = new Html5Qrcode(elementId);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 248 },
        (decodedText) => {
          setResult(decodedText);
          handleSubmitCode(decodedText);
          void (async () => {
            try {
              await stopCamera();
            } catch (_e) {
              console.log("Error in stopping camera:", _e);
            }
          })();
        },
        (_errorMessage) => {
          console.log("Error in Reading QR:", _errorMessage);
        },
      );
    } catch (e) {
      console.error(e);
      setError("カメラにアクセスできません");
    }
  }, [handleSubmitCode, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      void stopCamera();
    };
  }, [startCamera, stopCamera]);

  // scanning handled by html5-qrcode

  return (
    <Box>
      <Stack spacing={2}>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <div
            ref={scannerRef}
            id={`html5qr-scanner-${eventId}`}
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
      </Stack>
    </Box>
  );
}
