"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "./snackbar";
import { useController } from "./global";
import { useAuth } from "@/app/(auth)/authHook";
import { getCookie, setCookie } from "@/helpers/storage";

export const useEvent = () => {
  const router = useRouter();
  const { setSBMessage, removeSBMessage } = useSnackbar();
  const { verifySignal } = useController();
  const { verifyAuth } = useAuth();

  const handleBrowserEvents = () => {
    const online = async () => {
      removeSBMessage();
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

    const handleVisibility = async () => {
      const isRecentlyAway = getCookie("recently_away");

      if (document.visibilityState === "visible") {
        if (!isRecentlyAway) await verifyAuth();
        console.log("Visible");
      }
      if (document.visibilityState === "hidden") {
        setCookie("recently_away", "true", 10);
      }
    };

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  };

  return {
    handleBrowserEvents,
  };
};
