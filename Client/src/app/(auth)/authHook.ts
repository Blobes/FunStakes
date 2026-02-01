"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverRoutes } from "@/helpers/routes";
import { useGlobalContext } from "../GlobalContext";
import { useController } from "@/hooks/global";
import { delay } from "@/helpers/global";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackbar";
import { usePage } from "@/hooks/page";

export const useAuth = () => {
  const { setAuthUser, setLoginStatus, setSnackBarMsg } = useGlobalContext();
  const { isOffline, isOnline, isUnstableNetwork } = useController();
  const { setLastPage } = usePage();
  const { setSBMessage } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const verifyAuth = async (retryCount = 0) => {
    try {
      const res = await fetchUserWithTokenCheck();

      // 1️⃣ SUCCESS
      if (res.status === "SUCCESS" && res.payload) {
        setAuthUser(res.payload);
        setLoginStatus("AUTHENTICATED");
        return;
      }

      // 2️⃣ SILENT RETRY (Cold Boot Only)
      // We only trigger this if the fetcher explicitly returned UNAUTHORIZED
      // and it's our first attempt in the hook.
      if (res.status === "UNAUTHORIZED" && retryCount === 0 && isOnline) {
        console.warn("Attempt 1 failed. Waiting for browser cookie sync...");
        await delay(500);
        return verifyAuth(1);
      }

      // 4️⃣ NETWORK ERROR / OFFLINE
      if (res.status === "ERROR" || isOffline || isUnstableNetwork) {
        setLoginStatus("UNKNOWN");
        // Only show error message if it's a real failure, not a simple 401
        if (res.message)
          setSBMessage({
            msg: { content: res.message, msgStatus: "ERROR", hasClose: true },
          });
        return;
      }

      // 3️⃣ FINAL UNAUTHENTICATED STATE
      if (res.status === "UNAUTHORIZED" && retryCount !== 0 && isOnline) {
        setAuthUser(null);
        setLoginStatus("UNAUTHENTICATED");
        return;
      }
    } catch (err: any) {
      // If we reach here, a critical code error occurred
      setAuthUser(null);
      setLoginStatus("UNKNOWN");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      //  Send logout request to backend
      await fetcher(serverRoutes.logout, { method: "POST" });
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
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
