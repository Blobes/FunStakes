"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Stack } from "@mui/material";
import { BlurEffect } from "../components/BlurEffect";
import { Header } from "@/navbars/top-navbar/Header";
import { SnackBars } from "@/components/SnackBars";
import { useAppContext } from "./AppContext";
import { Footer } from "@/navbars/Footer";
import { Modal, ModalRef } from "@/components/Modal";
import { useSharedHooks } from "@/hooks";
import { AuthStepper } from "./auth/login/AuthStepper";
import { clientRoutes, flaggedRoutes } from "@/helpers/info";
import { delay, isOnline, matchPaths } from "@/helpers/others";
import { useTheme } from "@mui/material/styles";
import { LeftNav } from "@/navbars/LeftNav";
import { RightSidebar } from "./feed-sidebar/RightSidebar";
import { useStyles } from "@/helpers/styles";
import { useAuth } from "./auth/authHooks";
import { ProgressIcon } from "@/components/Loading";
import { Offline } from "./Offline";
import Image from "next/image";
import { img } from "@/assets/exported";
import { Splash } from "./Splash";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { scrollBarStyle } = useStyles();
  const { verifyAuth } = useAuth();

  // Always initialize hooks here — top of the component
  const modalRef = useRef<ModalRef>(null);
  const {
    setSBMessage,
    openModal,
    isOnWeb,
    isOnAuth,
    removeMessage,
    isDesktop,
  } = useSharedHooks();
  const {
    snackBarMsgs,
    loginStatus,
    modalContent,
    lastPage,
    isGlobalLoading,
    setGlobalLoading,
  } = useAppContext();
  const [mounted, setMounted] = useState(false);

  const flaggedAppRoutes = flaggedRoutes.app.filter((route) =>
    matchPaths(pathname, route)
  );
  const isAllowedRoutes =
    flaggedRoutes.auth.includes(pathname) ||
    flaggedRoutes.web.some((r) => matchPaths(pathname, r)) ||
    flaggedAppRoutes.length > 0;

  const isOnWebRoute = isOnWeb(pathname);
  const isOnAuthRoute = isOnAuth(pathname);
  const isOnAppRoute = flaggedAppRoutes.length > 0;

  // ─────────────────────────────
  // 1️⃣ MOUNT + INITIAL AUTH CHECK & SERVICE WORKER REGISTRATION
  // ─────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("SW registered"))
        .catch((err) => console.error("SW registration failed:", err));
    }
    verifyAuth();
  }, []);

  // ─────────────────────────────
  // 2️⃣ AUTH MODAL STATE REACTIONS
  // ─────────────────────────────
  useEffect(() => {
    // Not allowed → redirect + exit
    if (!isAllowedRoutes) {
      router.replace(clientRoutes.about.path);
      return;
    }
  }, [loginStatus, isOnline(), isAllowedRoutes, router, pathname]);

  // ─────────────────────────────
  // 3️⃣ MODAL OPEN / CLOSE
  // ─────────────────────────────
  useEffect(() => {
    if (!modalContent) {
      modalRef.current?.closeModal();
      return;
    }
    requestAnimationFrame(() => {
      modalRef.current?.openModal();
    });
  }, [modalContent, openModal]);

  //─────────────────────────────
  // 4️⃣ BROWSER EVENTS
  // ─────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      removeMessage(1);
      verifyAuth();
    };

    const handleOffline = async () => {
      setGlobalLoading(true);
      setSBMessage({
        msg: {
          id: 1,
          title: "No internet connection",
          content: "Check your network and refresh the page",
          msgStatus: "ERROR",
          behavior: "FIXED",
          hasClose: true,
          cta: {
            label: "Refresh",
            action: () => router.refresh(),
          },
        },
      });
      verifyAuth();
      await delay(1000 * 5);
      setGlobalLoading(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pathname, lastPage, loginStatus, isOnline()]);

  if (!mounted || (isOnline() && loginStatus === "UNKNOWN")) {
    return <Splash />;
  }

  return (
    <Stack
      sx={{
        position: "fixed",
        height: "100vh",
        width: "100%",
        gap: 0,
        backgroundColor: theme.palette.gray[0],
        alignItems: !isOnline() ? "center" : "unset",
        justifyContent: !isOnline() ? "center" : "unset",
      }}>
      <BlurEffect />

      {!isOnline() && loginStatus === "UNKNOWN" ? (
        isGlobalLoading ? (
          <ProgressIcon otherProps={{ size: "20px" }} />
        ) : (
          <Offline />
        )
      ) : (
        <>
          {!isOnAuthRoute && <Header />}

          {!isOnAppRoute ? (
            children
          ) : (
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
              {isDesktop && loginStatus === "AUTHENTICATED" && <LeftNav />}
              {children}
            </Stack>
          )}
          {isOnWebRoute && <Footer />}

          {snackBarMsgs.messgages && <SnackBars snackBarMsg={snackBarMsgs} />}
          {modalContent && (
            <Modal
              ref={modalRef}
              content={modalContent.content}
              header={modalContent.header}
              shouldClose={modalContent.shouldClose}
              entryDir={modalContent.entryDir ?? "CENTER"}
              style={modalContent.style}
              onClose={modalContent.onClose}
            />
          )}
        </>
      )}
    </Stack>
  );
};
