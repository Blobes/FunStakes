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
  isOnline,
  setCookie,
} from "@/helpers/others";
import { SavedPage } from "@/types";
import { usePathname, useRouter } from "next/navigation";

export const useAuth = () => {
  const { setAuthUser, lastPage, setLoginStatus, setSnackBarMsgs } =
    useAppContext();
  const { setSBMessage, setLastPage, isOnAuth } = useSharedHooks();
  const router = useRouter();
  const pathname = usePathname();

  // Verify authentication
  const verifyAuth = async () => {
    const authToken = getCookie("access_token");
    const isOnAuthRoute = isOnAuth(pathname);
    const savedPage = getFromLocalStorage<SavedPage>();
    const pagePath = !isOnAuthRoute ? pathname : lastPage.path;
    setLastPage(
      isOnAuthRoute && savedPage
        ? savedPage
        : { title: extractPageTitle(pagePath), path: pagePath }
    );

    try {
      const res = await fetchUserWithTokenCheck();
      // Fully authenticated
      if (isOnline() && res.payload) {
        setAuthUser(res.payload);
        setLoginStatus("AUTHENTICATED");
        return;
      }

      // Set login status to unkown when offline
      if (!isOnline()) {
        setLoginStatus("UNKNOWN");
        return;
      }

      // Fully logged out
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      setSBMessage({
        msg: {
          content: res.message,
          msgStatus: "ERROR",
          hasClose: true,
        },
      });
      return;
    } catch (err: any) {
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      setLastPage(clientRoutes.home);
      setSBMessage({
        msg: { content: "Unable to verify session", msgStatus: "ERROR" },
      });
      return;
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
