"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverRoutes } from "@/helpers/routes";
import { useGlobalContext } from "../GlobalContext";
import { useController } from "@/hooks/global";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackbar";
import { usePage } from "@/hooks/page";
import { delay } from "@/helpers/global";

export const useAuth = () => {
  const { setAuthUser, setLoginStatus, setSnackBarMsg } = useGlobalContext();
  const { isOffline, isOnline, isUnstableNetwork } = useController();
  const { setLastPage } = usePage();
  const { setSBMessage } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const verifyAuth = async () => {
    try {
      const res = await fetchUserWithTokenCheck();
      // Success
      if (res.status === "SUCCESS" && res.payload) {
        setAuthUser(res.payload);
        setLoginStatus("AUTHENTICATED");
        return;
      }

      // Network Erorr / Offline
      if (res.status === "ERROR" || isOffline || isUnstableNetwork) {
        setLoginStatus("UNKNOWN");
        if (res.message)
          setSBMessage({
            msg: { content: res.message, msgStatus: "ERROR", hasClose: true },
          });
        return;
      }

      // Unauthorized State
      if (res.status === "UNAUTHORIZED" && isOnline) {
        setAuthUser(null);
        setLoginStatus("UNAUTHENTICATED");
        return;
      }

      const isMobile = window.innerWidth < 900;
      await delay(200);
      if (isOnline && res.status === "UNKNOWN" && !res.payload && isMobile) {
        setLoginStatus("PENDING");
        //  window.location.reload();
        return;
      }
    } catch (err: any) {
      // If we reach here, a critical code error occurred
      setAuthUser(null);
      setLoginStatus("UNKNOWN");
      console.log("Bad really bad");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      //  Send logout request to backend
      await fetcher(serverRoutes.logout, { method: "POST" });
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      sessionStorage.removeItem("auth_syncing");
      if (pathname !== clientRoutes.home.path) {
        setLastPage(clientRoutes.home);
        router.replace(clientRoutes.home.path);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      setSBMessage({
        msg: { content: error.message, msgStatus: "ERROR" },
      });
      console.error("Logout failed:", error);
    }
    //Reset feedback state
    setSnackBarMsg((prev) => ({ ...prev, messages: [], inlineMsg: null }));
  };

  return {
    verifyAuth,
    handleLogout,
  };
};
