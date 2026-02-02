"use client";

import { useController } from "@/hooks/global";
import { Stack } from "@mui/material";
import { useGlobalContext } from "../GlobalContext";
import { LeftNav } from "@/app/(app)/navbars/LeftNav";
import { useTheme } from "@mui/material/styles";
import { useStyles } from "@/hooks/style";
import { AppHeader } from "@/app/(app)/navbars/Header";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/app/(app)/navbars/BottomNav";
import { useRef } from "react";

export const App = ({ children }: { children: React.ReactNode }) => {
  const { isDesktop } = useController();
  const theme = useTheme();
  const { authStatus: loginStatus } = useGlobalContext();
  const { scrollBarStyle } = useStyles();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Logged in & on desktop */}
      {loginStatus === "AUTHENTICATED" && isDesktop && (
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
      {loginStatus === "AUTHENTICATED" && !isDesktop && (
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
      {loginStatus !== "AUTHENTICATED" && (
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
    </>)
}
