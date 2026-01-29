"use client";

import { signIn } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Divider,
} from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function SignInPageClient() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const res = await signIn.oauth2({
      providerId: "unique",
      callbackURL: `${window.location.origin}/`,
    });

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      redirect("/");
    }
  }

  return (
    <main className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-md">
        <CardContent className="p-6">
          <Typography variant="h4" component="h1" className="font-bold">
            Sign In
          </Typography>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              className="mt-4"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="flex items-center justify-center gap-3"
              sx={{ textTransform: "none" }}
            >
              <div className="flex items-center justify-center w-9 h-9 bg-white rounded-sm">
                <Image
                  src="/img/unique.png"
                  alt="UniQUE"
                  width={36}
                  height={36}
                />
              </div>
              <span className="font-medium">Sign in with UniQUE</span>
            </Button>
          </form>

          <Divider className="my-5" />

          <Typography variant="body2" color="textSecondary">
            サインインすることで、利用規約とプライバシーポリシーに同意したことになります。
          </Typography>
        </CardContent>
      </Card>
    </main>
  );
}
