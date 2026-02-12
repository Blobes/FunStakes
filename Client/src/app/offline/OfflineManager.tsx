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
import { RightSidebar } from "./navbars/right-sidebar/Sidebar";
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
        flexDirection: "column",
      }}>
      <Header />
      <Stack
        sx={{
          height: "100%",
          gap: theme.gap(0),
          overflowY: "hidden",
          overflowX: "auto",
          flexDirection: "row",
          width: "100%",
          ...scrollBarStyle(),
        }}>
        <LeftNav />
        {children}
        <RightSidebar />
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
