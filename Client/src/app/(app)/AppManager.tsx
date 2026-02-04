"use client";

import { useController } from "@/hooks/global";
import { Stack } from "@mui/material";
import { useGlobalContext } from "../GlobalContext";
import { LeftNav } from "@/app/(app)/navbars/LeftNav";
import { useTheme } from "@mui/material/styles";
import { useStyles } from "@/hooks/style";
import { AppHeader } from "@/app/(app)/navbars/Header";
import { BottomNav } from "@/app/(app)/navbars/BottomNav";
import { useRef } from "react";
import { RootUIContainer } from "@/components/Containers";
import { NetworkGlitchUI } from "@/components/NetworkGlitchUI";

export const AppManager = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop, isUnstableNetwork, isOffline } = useController();
  const theme = useTheme();
  const { authStatus } = useGlobalContext();
  const { scrollBarStyle } = useStyles();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Conditionally render the offline UI
  if (authStatus === "ERROR") {
    return <NetworkGlitchUI />;
  }

  return (
    <RootUIContainer>
      {/* Logged in & on desktop */}
      {authStatus === "AUTHENTICATED" && isDesktop && (
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
            <AppHeader />
            {children}
          </Stack>
        </Stack>
      )}

      {/* Logged in and NOT on a desktop screen */}
      {authStatus === "AUTHENTICATED" && !isDesktop && (
        <Stack
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
          <AppHeader scrollRef={scrollRef} />
          {children}
          <BottomNav scrollRef={scrollRef} />
        </Stack>
      )}

      {/* Not logged in on every screen size */}
      {authStatus !== "AUTHENTICATED" && (
        <Stack
          sx={{
            height: "100%",
            gap: theme.gap(0),
            overflowY: "auto",
            flexDirection: "column",
            [theme.breakpoints.down("md")]: {
              justifyContent: "flex-start",
              alignItems: "center",
            },
            ...scrollBarStyle(),
          }}>
          <AppHeader />
          {children}
        </Stack>
      )}
    </RootUIContainer>)
}
