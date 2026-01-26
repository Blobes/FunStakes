"use client";

import { useController } from "@/hooks/generalHooks";
import { Stack } from "@mui/material";
import { useAppContext } from "./AppContext";
import { LeftNav } from "@/navbars/app-navbar/LeftNav";
import { useTheme } from "@mui/material/styles";
import { useStyles } from "@/hooks/styleHooks";
import { AppHeader } from "@/navbars/app-navbar/AppHeader";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/navbars/app-navbar/BottomNav";
import { useRef } from "react";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isOnAuth, isDesktop } = useController();
  const theme = useTheme();
  const pathname = usePathname();
  const { loginStatus } = useAppContext();
  const { scrollBarStyle } = useStyles();
  const isOnAuthRoute = isOnAuth(pathname);
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
          {!isOnAuthRoute && <LeftNav />}
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
            {!isOnAuthRoute && <AppHeader />}
            {children}
          </Stack>
        </Stack>
      )}

      {/* Logged in and NOT on desktop view */}
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
            ...scrollBarStyle(),
          }}>
          {!isOnAuthRoute && <AppHeader scrollRef={scrollRef} />}
          {children}
          {!isOnAuthRoute && <BottomNav scrollRef={scrollRef} />}
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
          {!isOnAuthRoute && <AppHeader />}
          {children}
        </Stack>
      )}
    </>)
}
