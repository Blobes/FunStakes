"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Stack } from "@mui/material";
import { SnackBars } from "@/components/SnackBars";
import { useAppContext } from "./AppContext";
import { Modal, ModalRef } from "@/components/Modal";
import { useController } from "@/hooks/global";
import { clientRoutes, flaggedRoutes } from "@/helpers/routes";
import { delay, matchPaths } from "@/helpers/global";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "./(auth)/authHook";
import { Offline } from "../components/Offline";
import { Splash } from "../components/Splash";
import { AppWrapper } from "./(app)/AppWrapper";
import { useSnackbar } from "@/hooks/snackbar";
import { registerSW } from "@/helpers/registerSW";

export const App = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { verifyAuth } = useAuth();

  const modalRef = useRef<ModalRef>(null);
  const { openModal, verifySignal, isOnline,
    isUnstableNetwork, isOffline } = useController();
  const { setSBMessage, removeMessage, } = useSnackbar();
  const { snackBarMsg, loginStatus, modalContent, lastPage,
    networkStatus } = useAppContext();
  const [mounted, setMounted] = useState(false);

  const flaggedAppRoutes = flaggedRoutes.app.filter((route) =>
    matchPaths(pathname, route)
  );
  const isAllowedRoutes =
    flaggedRoutes.auth.includes(pathname) ||
    flaggedRoutes.web.some((r) => matchPaths(pathname, r)) ||
    flaggedAppRoutes.length > 0;
  const isOnAppRoute = flaggedAppRoutes.length > 0;

  // ─────────────────────────────
  // 1️⃣ MOUNT + INITIAL AUTH CHECK & SERVICE WORKER REGISTRATION
  // ─────────────────────────────
  useEffect(() => {
    registerSW()
  }, []);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      await delay(500)
      verifySignal();
      verifyAuth();
    }
    init();
  }, [networkStatus]);

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
    const handleOnline = async () => {
      removeMessage(1);
      verifySignal();
      verifyAuth();
    };

    const handleOffline = async () => {
      setSBMessage({
        msg: {
          id: 1,
          title: "No internet connection",
          content: "Refresh the page.",
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
  }, [pathname, lastPage, loginStatus,]);

  if (!mounted || loginStatus === "PENDING") {
    return <Splash />;
  }

  return (
    <Stack
      sx={{
        position: "fixed",
        height: "100svh",
        width: "100%",
        gap: 0,
        backgroundColor: theme.palette.gray[0],
        alignItems: !isOnline ? "center" : "unset",
        justifyContent: !isOnline ? "center" : "unset",
      }}>

      {(isOffline || isUnstableNetwork) && loginStatus === "UNKNOWN" ?
        <Offline /> : (
          <>
            {!isOnAppRoute ? (
              children
            ) : (
              <AppWrapper>{children}</AppWrapper>
            )}

            {snackBarMsg.messages && <SnackBars snackBarMsg={snackBarMsg} />}
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
