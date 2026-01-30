"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverRoutes } from "@/helpers/routes";
import { useGlobalContext } from "../GlobalContext";
import { useController } from "@/hooks/global";
import { extractPageTitle } from "@/helpers/global";
import { Page } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackbar";
import { getFromLocalStorage } from "@/helpers/storage";

export const useAuth = () => {
  const {
    setAuthUser,
    lastPage,
    setLoginStatus,
    setSnackBarMsg: setSnackBarMsgs,
  } = useGlobalContext();
  const { setLastPage, isOnAuth, isOffline, isOnline, isUnstableNetwork } =
    useController();
  const { setSBMessage } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  // Verify authentication
  const verifyAuth = async () => {
    const isOnAuthRoute = isOnAuth(pathname);
    const savedPage = getFromLocalStorage<Page>();
    const pagePath = !isOnAuthRoute ? pathname : lastPage.path;

    setLastPage(
      isOnAuthRoute && savedPage
        ? savedPage
        : { title: extractPageTitle(pagePath), path: pagePath },
    );

    try {
      const res = await fetchUserWithTokenCheck();
      // Fully authenticated
      if (res.status === "SUCCESS" && res.payload) {
        setAuthUser(res.payload);
        setLoginStatus("AUTHENTICATED");
        return;
      }

      // Set login status to unkown when offline
      if (res.status === "ERROR" || isOffline || isUnstableNetwork) {
        setLoginStatus("UNKNOWN");
        if (res.message)
          setSBMessage({
            msg: {
              content: res.message,
              msgStatus: "ERROR",
              hasClose: true,
            },
          });
        return;
      }

      // Fully logged out
      if (isOnline && res.status === "UNAUTHORIZED") {
        setAuthUser(null);
        setLoginStatus("UNAUTHENTICATED");
        return;
      }
    } catch (err: any) {
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
    setSnackBarMsgs((prev) => ({ ...prev, messages: [], inlineMsg: null }));
  };

  return {
    verifyAuth,
    handleLogout,
  };
};
