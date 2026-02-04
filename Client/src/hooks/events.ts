"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "./snackbar";
import { useController } from "./global";
import { useAuth } from "@/app/(auth)/authHook";

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
      if (document.visibilityState === "visible") {
        console.log("Visible");
        await verifyAuth();
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
