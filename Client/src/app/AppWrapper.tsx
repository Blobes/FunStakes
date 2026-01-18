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
import { deleteCookie, matchPaths, setCookie } from "@/helpers/others";
import { useTheme } from "@mui/material/styles";
import { LeftNav } from "@/navbars/LeftNav";
import { RightSidebar } from "./right-sidebar/RightSidebar";
import { useStyles } from "@/helpers/styles";
import { useAuth } from "./auth/authHooks";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { scrollBarStyle } = useStyles();
  const { verifyAuth } = useAuth();

  // Always initialize hooks here — top of the component
  const modalRef = useRef<ModalRef>(null);
  const { setSBMessage, openModal, closeModal, isOnWeb, isOnAuth } =
    useSharedHooks();
  const {
    snackBarMsgs,
    loginStatus,
    modalContent,
    authUser,
    lastPage,
    isOnline,
    setOnlineStatus,
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
  // 2️⃣ AUTH STATE REACTIONS
  // ─────────────────────────────
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    // AUTHENTICATED or not on app route close modal
    if (
      loginStatus === "AUTHENTICATED" ||
      loginStatus === "UNKNOWN" ||
      !isOnAppRoute
    ) {
      closeModal();
      return;
    }
    // Not allowed → redirect + exit
    if (!isAllowedRoutes) {
      router.replace(clientRoutes.about.path);
      return;
    }

    const showModal = () => {
      openModal({
        content: <AuthStepper />,
        onClose: () => closeModal(),
      });
    };
    // show once
    showModal();
    // repeat every 10 mins
    intervalId = setInterval(showModal, 60 * 1000 * 10);
    // single cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    loginStatus,
    isOnline,
    isOnAppRoute,
    isAllowedRoutes,
    router,
    clientRoutes.path,
    pathname,
  ]);

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
      setSBMessage({
        msg: {
          content: "You are now online",
          msgStatus: "SUCCESS",
        },
        override: true,
      });
      setOnlineStatus(true);
      !isOnAuthRoute && verifyAuth();
      deleteCookie("savedUser");
    };

    const handleOffline = () => {
      setSBMessage({
        msg: {
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
      setOnlineStatus(false);
      if (authUser) setCookie("savedUser", authUser._id, 20);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isOnline === true)
        !isOnAuthRoute && verifyAuth();
    };
    const handleFocus = () => {
      if (isOnline === true) !isOnAuthRoute && verifyAuth();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname, lastPage, loginStatus]);

  if (!mounted) {
    return null; // or splash loader
  }
  return (
    <Stack
      sx={{
        position: "fixed",
        height: "100vh",
        width: "100%",
        gap: 0,
        backgroundColor: theme.palette.gray[0],
      }}>
      <BlurEffect />
      {!isOnAuthRoute && <Header />}

      {isOnWebRoute || isOnAuthRoute ? (
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
          <LeftNav />
          {children}
          <RightSidebar />
        </Stack>
      )}

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
      <Footer />
    </Stack>
  );
};
