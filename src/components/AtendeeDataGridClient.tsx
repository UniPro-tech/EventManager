"use client";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridInitialState,
  GridRowSelectionModel,
} from "@mui/x-data-grid";
import React from "react";

export default function EventAtendeeDataGridClient({
  atendees,
  isAdmin,
}: {
  atendees: AtendeeDataGridRow[];
  isAdmin: boolean;
}) {
  const columns: GridColDef<(typeof atendees)[number]>[] = [
    { field: "id", headerName: "申し込みID", width: 250 },
    { field: "userName", headerName: "ユーザー名", width: 250 },
    { field: "eventName", headerName: "イベント名", width: 250 },
    { field: "status", headerName: "ステータス", width: 150 },
    { field: "createdAt", headerName: "作成日時", width: 200 },
    { field: "updatedAt", headerName: "更新日時", width: 200 },
  ];
  const initialState: GridInitialState = {
    columns: {
      columnVisibilityModel: {
        id: false,
      },
    },
  };
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>({ type: "include", ids: new Set() });
  const [row, setRow] = React.useState<AtendeeDataGridRow[]>(atendees);
  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Stack spacing={2} direction="row" mb={2}>
        <Card>
          <Typography variant="h6" component="div" sx={{ p: 2 }}>
            参加人数:{" "}
            {row.length -
              row.filter((atendee) => atendee.status === "おそらく参加")
                .length *
                0.3}
            人
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ pb: 2, px: 2 }}
          >
            おそらく参加は0.7人として計算
          </Typography>
        </Card>
      </Stack>
      <Stack spacing={2} direction="row" mb={2}>
        {isAdmin && (
          <Button
            variant="contained"
            color="error"
            disabled={rowSelectionModel.ids.size === 0}
            onClick={async () => {
              const idsToDelete = Array.from(rowSelectionModel.ids) as string[];
              await Promise.all(
                idsToDelete.map((id) =>
                  fetch(`/api/atendees/${id}`, {
                    method: "DELETE",
                  }),
                ),
              );
              // remove deleted rows from state
              setRow((prevRows) =>
                prevRows.filter((row) => !idsToDelete.includes(row.id)),
              );
              // clear selection
              setRowSelectionModel({ type: "include", ids: new Set() });
            }}
          >
            削除
          </Button>
        )}
      </Stack>
      <DataGrid
        rows={row}
        columns={columns}
        initialState={initialState}
        pageSizeOptions={[5]}
        checkboxSelection={isAdmin}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        showToolbar
        autoHeight
      />
    </Box>
  );
}

export interface AtendeeDataGridRow {
  id: string;
  userName: string;
  eventId: string;
  eventName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
