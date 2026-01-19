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
    const existingVisitor = getCookie("existingVisitor");
    setLastPage(
      isOnAuthRoute && savedPage
        ? savedPage
        : { title: extractPageTitle(pagePath), path: pagePath }
    );

    if (!existingVisitor) {
      setCookie(
        "existingVisitor",
        (Math.random() * 1e6).toFixed(0).toString(),
        60 * 24 * 7
      );
    }

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
      if (isOnline() && !authToken) {
        setAuthUser(null);
        setLoginStatus("UNAUTHENTICATED");
        setSBMessage({
          msg: {
            content: res.message,
            msgStatus: "ERROR",
            hasClose: true,
          },
        });
        !existingVisitor && setLastPage(clientRoutes.about);
        return;
      }
    } catch (err: any) {
      setAuthUser(null);
      setLoginStatus("UNAUTHENTICATED");
      setLastPage(clientRoutes.about);
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
