"use client";

import { useAppContext } from "@/app/AppContext";
import { useSharedHooks } from "@/hooks";
import { fetcher } from "@/helpers/fetcher";
import { IUser, SavedPage, SingleResponse } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import {
  deleteCookie,
  getCookie,
  getFromLocalStorage,
  setCookie,
} from "@/helpers/others";
import {
  clearLoginLock,
  formatRemainingTime,
  getLockRemaining,
} from "@/helpers/auth";
import { useRef } from "react";
import { clientRoutes, flaggedRoutes, serverRoutes } from "@/helpers/info";

interface LoginCredentials {
  email: string;
  password: string;
}
interface LoginResponse extends SingleResponse<IUser> {
  fixedMsg?: string;
}
interface CheckEmailResponse {
  emailNotTaken: boolean;
  message: string;
}

export const useAuth = () => {
  const {
    setAuthUser,
    lastPage,
    setLoginStatus,
    setSnackBarMsgs,
    setInlineMsg,
  } = useAppContext();
  const { setSBMessage, setLastPage, isWeb } = useSharedHooks();
  const router = useRouter();
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MIN = 2;
  const loginAttempts = parseInt(getCookie("loginAttempts") || "0", 10);
  const lockTimestamp = getCookie("loginLockTime");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const checkEmail = async (
    email: string
  ): Promise<CheckEmailResponse | null> => {
    try {
      const res = await fetcher<CheckEmailResponse>(serverRoutes.checkEmail, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return res;
    } catch (error: any) {
      setInlineMsg(error.message || "Something went wrong.");
      return null;
    }
  };

  const startLockCountdown = (lockTimestamp: number | string) => {
    // Prevent countdown if user isn't really locked out
    if (loginAttempts < MAX_ATTEMPTS && !lockTimestamp) {
      clearLoginLock();
      return;
    }
    // Clear any existing interval
    if (countdownRef.current) clearInterval(countdownRef.current);
    // Parse timestamp to number
    const lockTime =
      typeof lockTimestamp === "string" ? Number(lockTimestamp) : lockTimestamp;

    // Start countdown
    let remainingSec = getLockRemaining(lockTime, LOCKOUT_MIN);
    countdownRef.current = setInterval(() => {
      if (remainingSec <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        clearLoginLock();
        setSBMessage({
          msg: { content: "Login Activated", msgStatus: "SUCCESS" },
        });
        setInlineMsg(null);
      } else {
        setInlineMsg(
          `You've exceeded the maximum login attempts. Try again in ${formatRemainingTime(
            remainingSec
          )}. Or reset your password.`
        );
      }
      remainingSec--;
    }, 1000);
  };

  const handleLogin = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse | null> => {
    // Step 1: Check if user is locked
    const isLocked = loginAttempts >= MAX_ATTEMPTS && lockTimestamp;
    const remainingSec = isLocked
      ? getLockRemaining(lockTimestamp, LOCKOUT_MIN)
      : 0;
    if (remainingSec <= 0) clearLoginLock();

    try {
      // Login request
      const res = await fetcher<LoginResponse>(serverRoutes.login, {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const { payload, message, status } = res;
      if (!payload || status !== "SUCCESS") return null;

      setAuthUser(payload);
      setLoginStatus("AUTHENTICATED");

      //const currentPath = window.location.pathname;
      const isExcludedRoute = flaggedRoutes.auth.includes(pathname);

      const isLastWeb = isWeb(lastPage.path);
      const savedPage = getFromLocalStorage<SavedPage>();

      setLastPage(
        isLastWeb
          ? clientRoutes.home
          : isExcludedRoute && savedPage
          ? savedPage
          : clientRoutes.about
      );
      setCookie("existingUser", payload._id, 60 * 24 * 7);

      //Clear cookies
      deleteCookie("loginAttempts");

      return { payload, message, status };
    } catch (error: any) {
      // Step 4: Handle failure
      const msg = error.message || "";
      const isPasswordErr = msg.toLowerCase().includes("password");

      if (isPasswordErr) {
        setCookie("loginAttempts", String(loginAttempts + 1), LOCKOUT_MIN);
      }

      let fixedMessage = msg;
      if (isPasswordErr && loginAttempts + 1 < MAX_ATTEMPTS) {
        fixedMessage = `Wrong password. You have ${
          MAX_ATTEMPTS - loginAttempts - 1
        } attempt(s) left.`;
      } else if (isPasswordErr && loginAttempts + 1 >= MAX_ATTEMPTS) {
        const lockTime = Date.now();
        setCookie("loginLockTime", String(lockTime), LOCKOUT_MIN);
        startLockCountdown(lockTime);
        return null;
      }

      return {
        payload: null,
        message: error.message,
        fixedMsg: fixedMessage,
        status: error.status,
      };
    }
  };

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
    checkEmail,
    handleLogin,
    handleLogout,
    loginAttempts,
    MAX_ATTEMPTS,
    lockTimestamp,
    startLockCountdown,
  };
};
