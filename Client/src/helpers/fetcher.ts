"use client";

import { IUser } from "@/types";
import { serverRoutes } from "./routes";
import { delay } from "./global";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TIMEOUT = 5000; // Default timeout in milliseconds

export const fetcher = async <T>(
  endpoint: string,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<T> => {
  const controller = new AbortController();
  const signal = controller.signal;
  const timeoutId = setTimeout(() => controller.abort("timeout"), timeout);

  try {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: options.method || "GET",
      headers,
      signal,
      credentials: "include", // Needed for cookie-based auth
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.message || "Something went wrong",
      ) as any;
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.log(error);
      throw new Error("Connection timed out or failed.");
    }

    if (error.message === "Failed to fetch" || error instanceof TypeError) {
      error.status = 0;
      throw error;
    }
    throw error;
  }
};

interface TokenCheckResponse {
  payload: IUser | null;
  message?: string;
  status?: "SUCCESS" | "UNAUTHORIZED" | "ERROR";
}
export const fetchUserWithTokenCheck =
  async (): Promise<TokenCheckResponse> => {
    try {
      const res = await fetcher<{ user: IUser }>(serverRoutes.verifyAuthToken);
      console.log(true);
      return { payload: res.user, status: "SUCCESS" };
    } catch (err: any) {
      // Check if it's a network/timeout error
      const isTimeout = err.name === "AbortError" && err.reason === "timeout";

      const isBrowserAbort =
        err.name === "AbortError" && err.reason !== "timeout";
      // If the browser killed the request due to refresh/navigation
      if (isBrowserAbort) {
        return { payload: null, status: "ERROR" };
      }
      // A real network fail usually has no status AND is a TypeError
      const isFetchFailed =
        (err.message === "Failed to fetch" || err.name === "TypeError") &&
        !err.status;

      let msg = err.message;

      if (isFetchFailed || isTimeout || err.status >= 500) {
        msg = null;
        return {
          payload: null,
          status: "ERROR",
          message: isFetchFailed ? msg : "Connection failed or timed out",
        };
      }

      // // 1. Stop the loop if we've tried 2 times
      // if (attempt >= 1) {
      //   console.error("Stopping infinite refresh loop.");
      //   return {
      //     payload: null,
      //     status: "UNAUTHORIZED",
      //     message: "Session expired. Please log in again.",
      //   };
      // }

      // 2. Catch 401 (Missing/Expired) OR 403 (Invalid)
      if (err.status === 401 || err.status === 403) {
        msg = null;
        // Try to refresh once
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Only one recursive call allowed here
          try {
            const retryRes = await fetcher<{ user: IUser }>(
              serverRoutes.verifyAuthToken,
            );
            return { payload: retryRes.user, status: "SUCCESS" };
          } catch {
            // If the retry after refresh fails, it's a hard UNAUTHORIZED
            console.error("Retry failed");
            // return {
            //   payload: null,
            //   status: "UNAUTHORIZED",
            //   message: "Session expired. Please log in again.",
            // };
          }
        }
      }
      console.log(false);
      return {
        payload: null,
        status: "UNAUTHORIZED",
        message: msg,
      };
    }
  };

const refreshAccessToken = async () => {
  try {
    const res = await fetcher(serverRoutes.refreshToken, {
      method: "POST",
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
