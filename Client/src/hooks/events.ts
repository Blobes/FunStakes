"use client";

import { useRouter } from "next/navigation";
import { deleteCookie, getCookie, setCookie } from "@/helpers/storage";
import { useSnackbar } from "./snackbar";
import { useGlobalContext } from "@/app/GlobalContext";
import { useController } from "./global";
import { useAuth } from "@/app/(auth)/authHook";
import { useRef } from "react";

export const useEvent = () => {
  const router = useRouter();
  const { setSBMessage, removeMessage } = useSnackbar();
  const { authUser, setGlobalLoading } = useGlobalContext();
  const { verifySignal, isDesktop } = useController();
  const { verifyAuth } = useAuth();

  // const authUserRef = useRef(authUser);
  // authUserRef.current = authUser;

  const handleBrowserEvents = () => {
    const online = async () => {
      removeMessage(1);
      await verifySignal();
      await verifyAuth();
    };

    const offline = () => {
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

    // const handleVisibility = () => {
    //   if (document.visibilityState === "hidden" && authUserRef.current?._id)
    //     setCookie("recently_away", authUserRef.current._id, 30);
    // };

    // document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      //  document.removeEventListener("visibilitychange", handleVisibility);
    };
  };

  const handlePageLoad = () => {
    const canary = getCookie("logged_in");
    const isSyncing = sessionStorage.getItem("auth_syncing");
    const isMobile = window.innerWidth < 900;

    // If canary is missing on mobile
    if (!canary && isMobile) {
      // Check if we already tried reloading once
      if (isSyncing) {
        console.log("Sync attempted, but no session found. Stopping.");
        sessionStorage.removeItem("auth_syncing");
        setGlobalLoading(false);
        return; // Break the loop
      }
      // First attempt: Set the flag and reload
      setGlobalLoading(true);
      sessionStorage.setItem("auth_syncing", "true");
      // Give the browser 100ms to ensure storage is set before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }
    // If canary IS found, clear the syncing flag for next time
    if (canary && isSyncing) {
      sessionStorage.removeItem("auth_syncing");
    }
  };

  return {
    handleBrowserEvents,
    handlePageLoad,
  };
};
