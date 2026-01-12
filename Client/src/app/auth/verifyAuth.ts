"use client";

import { extractPageTitle, getCookie } from "@/helpers/others";
import { fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { IUser, SavedPage } from "@/types";
import { defaultPage, clientRoutes } from "@/helpers/info";

interface VerifyParams {
  setAuthUser: Function;
  setLoginStatus: Function;
  setSBMessage: Function;
  setLastPage: (page: SavedPage) => void;
  pathname: string;
  isAllowedAuthRoutes: boolean;
  isOnline: boolean;
}

export const verifyAuth = async ({
  setAuthUser,
  setLoginStatus,
  setSBMessage,
  setLastPage,
  pathname,
  isAllowedAuthRoutes,
  isOnline,
}: VerifyParams) => {
  try {
    const res = await fetchUserWithTokenCheck();
    const pagePath = !isAllowedAuthRoutes ? pathname : clientRoutes.timeline;

    // Fully authenticated
    if (isOnline && res.payload) {
      setAuthUser(res.payload);
      setLoginStatus("AUTHENTICATED");
      setLastPage({ title: extractPageTitle(pagePath), path: pagePath });
      return;
    }

    // Set login status to unkown when offline
    if (!isOnline) {
      setLoginStatus("UNKNOWN");
      setLastPage({ title: extractPageTitle(pagePath), path: pagePath });
      if (!res.message?.toLowerCase().includes("no token")) {
        setSBMessage({
          msg: { content: res.message, msgStatus: "ERROR", hasClose: true },
          override: true,
        });
      }
      return;
    }

    // 🚫 Fully logged out
    setAuthUser(null);
    setLoginStatus("UNAUTHENTICATED");
    setLastPage({ title: defaultPage.title, path: defaultPage.path });
    return;
  } catch (err: any) {
    setAuthUser(null);
    setLoginStatus("UNAUTHENTICATED");
    setLastPage({ title: defaultPage.title, path: defaultPage.path });
    setSBMessage({
      msg: { content: "Unable to verify session", msgStatus: "ERROR" },
    });
    return;
  }
};
