"use client";

import {
  extractPageTitle,
  getCookie,
  getFromLocalStorage,
} from "@/helpers/others";
import { fetchUserWithTokenCheck } from "@/helpers/fetcher";
import { SavedPage } from "@/types";
import { clientRoutes } from "@/helpers/info";

interface VerifyParams {
  setAuthUser: Function;
  setLoginStatus: Function;
  setSBMessage: Function;
  setLastPage: (page: SavedPage) => void;
  lastPage: SavedPage;
  pathname: string;
  isOnAuthRoute: boolean;
  isOnline: boolean;
}

export const verifyAuth = async ({
  setAuthUser,
  setLoginStatus,
  setSBMessage,
  setLastPage,
  lastPage,
  pathname,
  isOnAuthRoute,
  isOnline,
}: VerifyParams) => {
  try {
    const savedPage = getFromLocalStorage<SavedPage>();
    const pagePath = !isOnAuthRoute ? pathname : lastPage.path;
    setLastPage(
      isOnAuthRoute && savedPage
        ? savedPage
        : { title: extractPageTitle(pagePath), path: pagePath }
    );

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
    setSBMessage({
      msg: { content: "Unable to verify session", msgStatus: "ERROR" },
    });
    return;
  }
};
