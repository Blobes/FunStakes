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
import { verifyAuth } from "./auth/verifyAuth";
import { defaultPage, flaggedRoutes } from "@/helpers/info";
import { deleteCookie, matchPaths, setCookie } from "@/helpers/others";
import { useTheme } from "@mui/material/styles";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  // Always initialize hooks here — top of the component
  const modalRef = useRef<ModalRef>(null);
  const { setSBMessage, setLastPage, openModal, closeModal } = useSharedHooks();
  const {
    snackBarMsgs,
    loginStatus,
    setLoginStatus,
    modalContent,
    authUser,
    setAuthUser,
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

  const isAllowedAuthRoutes = flaggedRoutes.auth.includes(pathname);
  const isOnAppRoute = flaggedAppRoutes.length > 0;

  const verifyUserAuth = async () =>
    await verifyAuth({
      setAuthUser,
      setLoginStatus,
      setSBMessage,
      setLastPage,
      pathname,
      isAllowedAuthRoutes,
      isOnline,
    });

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
    verifyUserAuth();
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
      router.replace(defaultPage.path);
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
    defaultPage.path,
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
      verifyUserAuth();
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
        verifyUserAuth();
    };
    const handleFocus = () => {
      if (isOnline === true) verifyUserAuth();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", verifyUserAuth);
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
      {!isAllowedAuthRoutes && <Header />}
      {snackBarMsgs.messgages && <SnackBars snackBarMsg={snackBarMsgs} />}
      {children}
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
