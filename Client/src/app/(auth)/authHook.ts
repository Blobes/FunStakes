"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverRoutes } from "@/helpers/routes";
import { useGlobalContext } from "../GlobalContext";
import { useController } from "@/hooks/global";
import { delay, extractPageTitle } from "@/helpers/global";
import { Page } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackbar";
import { getFromLocalStorage } from "@/helpers/storage";

export const useAuth = () => {
  const { setAuthUser, lastPage, setLoginStatus, setSnackBarMsg } =
    useGlobalContext();
  const { setLastPage, isOnAuth, isOffline, isOnline, isUnstableNetwork } =
    useController();
  const { setSBMessage } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  // Verify authentication with Silent Retry for cold boots
  const verifyAuth = async (retryCount = 0) => {
    const isOnAuthRoute = isOnAuth(pathname);
    const savedPage = getFromLocalStorage<Page>();
    const pagePath = !isOnAuthRoute ? pathname : lastPage.path;

    // We only set the last page on the first attempt to avoid redundant storage writes
    if (retryCount === 0) {
      setLastPage(
        isOnAuthRoute && savedPage
          ? savedPage
          : { title: extractPageTitle(pagePath), path: pagePath },
      );
    }

    try {
      const res = await fetchUserWithTokenCheck();

      // SUCCESS: Fully authenticated
      if (res.status === "SUCCESS" && res.payload) {
        setAuthUser(res.payload);
        setLoginStatus("AUTHENTICATED");
        return;
      }

      // SILENT RETRY: The "Cold Boot" Fix
      // If we get UNAUTHORIZED on the first try, wait 800ms and try one more time
      // This catches instances where cookies weren't attached because the browser was idle
      if (res.status === "UNAUTHORIZED" && retryCount === 0 && isOnline) {
        console.warn("Auth failed on cold boot. Performing silent retry...");
        //  await new Promise((resolve) => setTimeout(resolve, 800));
        await delay(1500);
        return verifyAuth(1);
      }

      // NETWORK ERROR / OFFLINE
      if (res.status === "ERROR" || isOffline || isUnstableNetwork) {
        setLoginStatus("UNKNOWN");
        if (res.message) {
          setSBMessage({
            msg: {
              content: res.message,
              msgStatus: "ERROR",
              hasClose: true,
            },
          });
        }
        return;
      }

      // UNAUTHENTICATED: Only set this if the retry also failed
      if (isOnline && res.status === "UNAUTHORIZED") {
        setAuthUser(null);
        setLoginStatus("UNAUTHENTICATED");
        return;
      }
    } catch (err: any) {
      // If a hard crash happens, try one silent retry before showing error
      if (retryCount === 0 && isOnline) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return verifyAuth(1);
      }
      setAuthUser(null);
      setLoginStatus("UNKNOWN");
      setSBMessage({
        msg: { content: "Unable to verify session", msgStatus: "ERROR" },
      });
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
