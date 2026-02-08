"use client";

import { useController } from "@/hooks/global";
import { Stack } from "@mui/material";
import { useGlobalContext } from "../GlobalContext";
import { useTheme } from "@mui/material/styles";
import { useStyles } from "@/hooks/style";
import { useEffect, useRef } from "react";
import { Header } from "./navbars/Header";
import { LeftNav } from "./navbars/LeftNav";
import { BottomNav } from "./navbars/BottomNav";
import { RightSidebar } from "./sidebar/RightSidebar";
import { usePage } from "@/hooks/page";
import { getFromLocalStorage } from "@/helpers/storage";
import { Page } from "@/types";
import { clientRoutes } from "@/helpers/routes";
import { useOffline } from "./offlineHook";

export const OfflineManager = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop, isOnline } = useController();
  const theme = useTheme();
  const { networkStatus } = useGlobalContext();
  const { scrollBarStyle } = useStyles();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { switchToOnlineMode } = useOffline()

  useEffect(() => {
    if (isOnline) switchToOnlineMode();
  }, [networkStatus]);

  return isDesktop ? (
    <Stack
      sx={{
        height: "100%",
        gap: theme.gap(0),
        overflowY: "hidden",
        flexDirection: "row",
      }}>
      <LeftNav />
      <Stack
        sx={{
          height: "100%",
          gap: theme.gap(0),
          overflowY: "hidden",
          overflowX: "auto",
          flexDirection: "column",
          width: "100%",
          [theme.breakpoints.down("md")]: {
            overflowY: "auto",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "column",
          },
          ...scrollBarStyle(),
        }}>
        <Header />
        <Stack sx={{
          height: "100%",
          flexDirection: "row",
          overflow: "hidden",
          borderTop: `1px solid ${theme.palette.gray.trans[1]}`,
        }}>
          {children}
          <RightSidebar />
        </Stack>
      </Stack>
    </Stack>
  ) :
    // Mobile view
    (<Stack
      ref={scrollRef}
      sx={{
        height: "100%",
        gap: theme.gap(0),
        overflowY: "auto",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        paddingBottom: theme.boxSpacing(23),
        ...scrollBarStyle(),
      }}>
      <Header scrollRef={scrollRef} />
      {children}
      <BottomNav scrollRef={scrollRef} />
    </Stack>)
}
