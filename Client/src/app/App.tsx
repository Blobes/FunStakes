"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Stack } from "@mui/material";
import { BlurEffect } from "../components/BlurEffect";
import { SnackBars } from "@/components/Snackbars";
import { useAppContext } from "./AppContext";
import { Footer } from "@/navbars/Footer";
import { Modal, ModalRef } from "@/components/Modal";
import { useController } from "@/hooks/generalHooks";
import { clientRoutes, flaggedRoutes } from "@/helpers/info";
import { matchPaths } from "@/helpers/others";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "./auth/authHooks";
import { ProgressIcon } from "@/components/Loading";
import { Offline } from "../components/Offline";
import { Splash } from "../components/Splash";
import { WebHeader } from "@/navbars/web-navbar/WebHeader";
import { AppWrapper } from "./AppWrapper";
import { useSnackbar } from "@/hooks/snackbarHooks";

export const App = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { verifyAuth } = useAuth();

  // Always initialize hooks here — top of the component
  const modalRef = useRef<ModalRef>(null);
  const { openModal, isOnWeb, isOnAuth, verifySignal, isOnline,
    isUnstableNetwork, isOffline } = useController();
  const { setSBMessage, removeMessage, } = useSnackbar();
  const { snackBarMsgs, loginStatus, modalContent, lastPage,
    isGlobalLoading, setGlobalLoading, networkStatus
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
    // Verify network signal
    verifySignal();
    // Verify user auth
    verifyAuth();
  }, []);

  useEffect(() => {
    // Not allowed → redirect + exit
    if (!isAllowedRoutes) {
      router.replace(clientRoutes.about.path);
      return;
    }
  }, [isAllowedRoutes, router, pathname]);

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
      verifySignal();
    };

    const handleOffline = async () => {
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
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pathname, lastPage, loginStatus]);

  if (!mounted || (isOnline && loginStatus === "UNKNOWN")) {
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
        alignItems: !isOnline ? "center" : "unset",
        justifyContent: !isOnline ? "center" : "unset",
      }}>
      <BlurEffect />

      {(isOffline || isUnstableNetwork) && loginStatus === "UNKNOWN" ? (
        isGlobalLoading ? (
          <ProgressIcon otherProps={{ size: "20px" }} />
        ) : (
          <Offline />
        )
      ) : (
        <>
          {!isOnAuthRoute && isOnWebRoute && <WebHeader />}

          {!isOnAppRoute ? (
            children
          ) : (
            <AppWrapper>{children}</AppWrapper>
          )}

          {isOnWebRoute && <Footer />}

          {snackBarMsgs.messgages && <SnackBars snackBarMsg={snackBarMsgs} />}
          {modalContent && (
            <Modal
              ref={modalRef}
              content={modalContent.content}
              showHeader={modalContent.showHeader}
              header={modalContent.header}
              clickToClose={modalContent.clickToClose}
              dragToClose={modalContent.dragToClose}
              transition={modalContent.transition}
              style={modalContent.style}
              onClose={modalContent.onClose}
            />
          )}
        </>
      )}
    </Stack>
  );
};
