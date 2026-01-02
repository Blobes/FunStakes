"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Stack } from "@mui/material";
import { BlurEffect } from "../components/BlurEffect";
import { Header } from "@/navbars/top-navbar/Header";
import { SnackBars } from "@/components/SnackBars";
import { useAppContext } from "./AppContext";
import { Footer } from "@/components/Footer";
import { Modal, ModalRef } from "@/components/Modal";
import { useSharedHooks } from "@/hooks";
import { AuthStepper } from "./auth/login/AuthStepper";
import { verifyAuth } from "./auth/verifyAuth";
import { defaultPage, flaggedRoutes } from "@/helpers/info";
import { matchPaths } from "@/helpers/others";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Always initialize hooks here — top of the component
  const modalRef = useRef<ModalRef>(null);
  const { setSBMessage, setLastPage, openModal, closeModal } = useSharedHooks();
  const {
    snackBarMsgs,
    loginStatus,
    setLoginStatus,
    modalContent,
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

    verifyAuth({
      setAuthUser,
      setLoginStatus,
      setSBMessage,
      setLastPage,
      pathname,
      isAllowedAuthRoutes,
    });
  }, []);

  // ─────────────────────────────
  // 2️⃣ AUTH STATE REACTIONS
  // ─────────────────────────────
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    // AUTHENTICATED or not on app route close modal
    if (loginStatus === "AUTHENTICATED" || !isOnAppRoute) {
      closeModal();
      return;
    }
    // Not allowed → redirect + exit
    if (!isAllowedRoutes) {
      router.replace(defaultPage.path);
      return;
    }

    console.log("Hello");
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
  }, [loginStatus, isOnAppRoute, isAllowedRoutes, router, defaultPage.path]);

  // ─────────────────────────────
  // 3️⃣ MODAL OPEN / CLOSE
  // ─────────────────────────────
  useEffect(() => {
    if (!modalContent) return;

    requestAnimationFrame(() => {
      modalRef.current?.openModal();
    });
  }, [modalContent, openModal]);

  //─────────────────────────────
  // 4️⃣ BROWSER EVENTS
  // ─────────────────────────────
  useEffect(() => {
    const reverify = async () =>
      await verifyAuth({
        setAuthUser,
        setLoginStatus,
        setSBMessage,
        setLastPage,
        pathname,
        isAllowedAuthRoutes,
      });

    const handleOnline = () => {
      setSBMessage({
        msg: {
          content: "You are now online",
          msgStatus: "SUCCESS",
        },
        override: true,
      });
      setOnlineStatus(true);
      reverify();
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
            action: () => window.location.reload(),
          },
        },
      });
      setOnlineStatus(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isOnline === true)
        reverify();
    };
    const handleFocus = () => {
      if (isOnline === true) reverify();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", reverify);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pathname, lastPage]);

  if (!mounted || loginStatus === "UNKNOWN") {
    return null; // or splash loader
  }
  return (
    <Stack sx={{ position: "fixed", height: "100vh", width: "100%", gap: 0 }}>
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
