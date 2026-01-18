"use client";

import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RightSidebar } from "../right-sidebar/RightSidebar";
import { Posts } from "../post/Posts";
import { useStyles } from "@/helpers/styles";

export default function TimelinePage() {
  const theme = useTheme();
  const { scrollBarStyle, autoScroll } = useStyles();

  return (
    <Stack
      sx={{
        height: "100%",
        gap: theme.gap(0),
        overflowY: "hidden",
        overflowX: "auto",
        flexDirection: "row",
        justifyContent: "center",
        [theme.breakpoints.down("md")]: {
          overflowY: "auto",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
        },
        ...scrollBarStyle(),
      }}>
      {/* <Stack
        sx={{
          width: "18%",
          maxWidth: "400px",
          minWidth: "250px",
          padding: theme.boxSpacing(8, 16),
          ...autoScroll().base,
          [theme.breakpoints.down("md")]: {
            display: "none",
            ...autoScroll().mobile,
          },
        }}>
        Left hand navigation
      </Stack> */}
      <Posts />
      <RightSidebar />
    </Stack>
  );
}
