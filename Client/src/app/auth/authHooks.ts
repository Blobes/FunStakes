"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverRoutes } from "@/helpers/routes";
import { useAppContext } from "../AppContext";
import { useController } from "@/hooks/generalHooks";
import { extractPageTitle, getFromLocalStorage } from "@/helpers/others";
import { Page } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackbarHooks";

export const useAuth = () => {
  const {
    setAuthUser,
    lastPage,
    setLoginStatus,
    setSnackBarMsg: setSnackBarMsgs,
  } = useAppContext();
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
        return;
      }

      // Fully logged out
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      if (res.message)
        setSBMessage({
          msg: {
            content: res.message,
            msgStatus: "ERROR",
            hasClose: true,
          },
        });
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
    setSnackBarMsgs((prev) => ({ ...prev, messgages: [], inlineMsg: null }));
  };

  return {
    verifyAuth,
    handleLogout,
  };
};
