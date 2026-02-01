"use client";

import { useGlobalContext } from "@/app/GlobalContext";
import { fetcher } from "@/helpers/fetcher";
import { IUser, Page, SingleResponse } from "@/types";

import {
  clearLoginLock,
  formatRemainingTime,
  getLockRemaining,
} from "@/helpers/auth";
import { useRef } from "react";
import { clientRoutes, serverRoutes } from "@/helpers/routes";
import { useSnackbar } from "@/hooks/snackbar";
import {
  deleteCookie,
  getCookie,
  getFromLocalStorage,
  setCookie,
} from "@/helpers/storage";
import { usePage } from "@/hooks/page";

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

export const useLogin = () => {
  const { setAuthUser, setLoginStatus, setInlineMsg, isAuthLoading } =
    useGlobalContext();
  const { setLastPage, isOnWeb } = usePage();
  const { setSBMessage } = useSnackbar();
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MIN = 2;
  const loginAttempts = parseInt(getCookie("loginAttempts") || "0", 10);
  const lockTimestamp = getCookie("loginLockTime");
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const checkEmail = async (
    email: string,
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
            remainingSec,
          )}. Or reset your password.`,
        );
      }
      remainingSec--;
    }, 1000);
  };

  const handleLogin = async (
    credentials: LoginCredentials,
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

      if (!payload || status !== "SUCCESS") return null; // Return early

      setAuthUser(payload);
      setLoginStatus("AUTHENTICATED");
      setCookie("was_logged_in", "true", 60 * 24 * 30);

      // const isExcludedRoute = flaggedRoutes.auth.includes(pathname);
      const savedPage = getFromLocalStorage<Page>();
      const savedPath = savedPage ? savedPage.path : "";
      const isLastWeb = isOnWeb(savedPath);

      setLastPage(!isLastWeb && savedPage ? savedPage : clientRoutes.home);

      //Clear cookies
      deleteCookie("loginAttempts");

      // Success feedback
      !isAuthLoading &&
        setSBMessage({
          msg: { content: message, msgStatus: status, hasClose: true },
        });

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

      // Error feedback
      setInlineMsg(fixedMessage ?? null);

      return {
        payload: null,
        message: error.message,
        fixedMsg: fixedMessage,
        status: error.status,
      };
    }
  };

  return {
    checkEmail,
    handleLogin,
    loginAttempts,
    MAX_ATTEMPTS,
    lockTimestamp,
    startLockCountdown,
  };
};
