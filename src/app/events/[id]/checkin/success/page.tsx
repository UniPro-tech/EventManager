import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import { Box, Button, Card, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ReturnSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });
  if (!event) notFound();
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            width: "100%",
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <CheckCircleOutlineIcon
              sx={{
                fontSize: 64,
                color: "success.main",
              }}
            />
          </Box>

          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            出席登録完了
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
            出席登録が正常に完了しました！
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              component={Link}
              href={`/events/${id}`}
              variant="contained"
              fullWidth
              startIcon={<HomeIcon />}
            >
              イベントページへ戻る
            </Button>
          </Stack>
        </Card>
      </Box>
    </Container>
  );
}
