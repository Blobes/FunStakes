"use client";

import { fetcher, fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { clientRoutes, serverRoutes } from "@/helpers/info";
import { useAppContext } from "../AppContext";
import { useSharedHooks } from "@/hooks";
import {
  extractPageTitle,
  getCookie,
  getFromLocalStorage,
  deleteCookie,
} from "@/helpers/others";
import { SavedPage } from "@/types";
import { usePathname, useRouter } from "next/navigation";

export const useAuth = () => {
  const {
    setAuthUser,
    lastPage,
    setLoginStatus,
    setSnackBarMsgs,
    isOnline,
    setAuthLoading,
  } = useAppContext();
  const { setSBMessage, setLastPage, isOnAuth } = useSharedHooks();
  const router = useRouter();
  const pathname = usePathname();

  // Verify authentication
  const verifyAuth = async () => {
    const isOnAuthRoute = isOnAuth(pathname);
    const savedPage = getFromLocalStorage<SavedPage>();
    const pagePath = !isOnAuthRoute ? pathname : lastPage.path;
    setLastPage(
      isOnAuthRoute && savedPage
        ? savedPage
        : { title: extractPageTitle(pagePath), path: pagePath }
    );
    try {
      !isOnAuthRoute && setAuthLoading(true);
      const res = await fetchUserWithTokenCheck();
      // Fully authenticated
      if (isOnline && res.payload) {
        setAuthUser(res.payload);
        setLoginStatus("AUTHENTICATED");
        return;
      }

      // Set login status to unkown when offline
      if (!isOnline) {
        setLoginStatus("UNKNOWN");
        setSBMessage({
          msg: { content: res.message, msgStatus: "ERROR", hasClose: true },
          override: true,
        });
        return;
      }

      // Fully logged out
      const existingUser = getCookie("existingUser");
      if (!existingUser) setLastPage(clientRoutes.about);
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      !isOnAuthRoute &&
        setSBMessage({
          msg: {
            content: res.message,
            msgStatus: "ERROR",
            hasClose: true,
          },
          override: true,
        });
      return;
    } catch (err: any) {
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      setLastPage(clientRoutes.about);
      !isOnAuthRoute &&
        setSBMessage({
          msg: { content: "Unable to verify session", msgStatus: "ERROR" },
        });
      return;
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      //  Send logout request to backend
      await fetcher(serverRoutes.logout, { method: "POST" });
      setAuthUser(null);
      deleteCookie("user_snapshot");
      setLoginStatus("UNAUTHENTICATED");
      setLastPage(clientRoutes.about);
      router.replace(clientRoutes.about.path);
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
