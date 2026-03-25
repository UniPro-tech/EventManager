"use client";
import { Breadcrumbs, Link as MUILink, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  events: "イベント",
  new: "新規作成",
  hosted: "主催中",
  attended: "参加済み",
  edit: "編集",
  atendees: "参加者一覧",
};

function labelFor(segment: string) {
  if (!segment) return "";
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // treat likely ids (uuid or numeric) as "詳細"
  if (/^[0-9]+$/.test(segment) || /^[0-9a-fA-F-]{8,}$/.test(segment))
    return "詳細";
  // decode and use as-is for other segments
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export default function CustomBreadcrumbs() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [
    { href: "/", label: "ダッシュボード" },
    ...segments.map((seg, idx) => ({
      href: `/${segments.slice(0, idx + 1).join("/")}`,
      label: labelFor(seg),
    })),
  ];

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {crumbs.map((c, i) =>
        i < crumbs.length - 1 ? (
          <MUILink
            key={c.href}
            component={Link}
            href={c.href}
            underline="hover"
            color="inherit"
          >
            {c.label}
          </MUILink>
        ) : (
          <Typography key={c.href} sx={{ color: "text.primary" }}>
            {c.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
}
