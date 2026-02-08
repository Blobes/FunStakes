"use client";

import { useRouter } from "next/navigation";
import { useSnackbar } from "./snackbar";
import { useController } from "./global";
import { useAuth } from "@/app/(auth)/authHook";
import { getCookie, setCookie } from "@/helpers/storage";
import { useGlobalContext } from "@/app/GlobalContext";
import { useOffline } from "@/app/offline/offlineHook";

export const useEvent = () => {
  const router = useRouter();
  const { setSBMessage, removeSBMessage } = useSnackbar();
  const { verifySignal } = useController();
  const { verifyAuth } = useAuth();
  const { setGlobalLoading, setNetworkStatus } = useGlobalContext();
  const { switchToOnlineMode } = useOffline();

  const handleBrowserEvents = () => {
    const online = () => {
      removeSBMessage();
      // Switch back to online mode
      switchToOnlineMode();
      setNetworkStatus("STABLE");

      verifyAuth();
    };

    const offline = () => {
      setNetworkStatus("OFFLINE");
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
      const recentlyAway = getCookie("recently_away");

      if (document.visibilityState === "visible") {
        if (!recentlyAway) {
          await verifyAuth();
        }
      }
      if (document.visibilityState === "hidden") {
        setCookie("recently_away", "true", 12);
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
