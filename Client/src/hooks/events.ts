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
  const { authUser } = useGlobalContext();
  const { verifySignal } = useController();
  const { verifyAuth } = useAuth();

  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;

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

    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && authUserRef.current?._id)
        setCookie("recently_away", authUserRef.current._id, 30);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
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
