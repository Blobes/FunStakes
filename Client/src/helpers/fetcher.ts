"use client";

import { IUser } from "@/types";
import { serverRoutes } from "./routes";
import { delay } from "./global";
import { error } from "console";

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
  status?: "SUCCESS" | "UNAUTHORIZED" | "ERROR" | "UNKNOWN";
}
export const fetchUserWithTokenCheck = async (
  retryCount = 0,
): Promise<TokenCheckResponse> => {
  const MAX_RETRIES = 2;
  try {
    const res = await fetcher<{ user: IUser }>(serverRoutes.verifyAuthToken);
    // console.log(res);
    return { payload: res.user, status: "SUCCESS" };
  } catch (err: any) {
    // let msg = err.message;

    if (err === "timeout" || err.message?.includes("timeout")) {
      if (retryCount < MAX_RETRIES) {
        // Add a small delay (200ms) to let the browser's network stack "warm up"
        await new Promise((resolve) => setTimeout(resolve, 200));
        return await fetchUserWithTokenCheck(retryCount + 1);
      }

      return {
        payload: null,
        status: "ERROR",
        message: "Request timed out after multiple attempts",
      };
    }

    // Catch 401 (Missing/Expired) OR 403 (Invalid)
    if (err.status === 401 || err.status === 403) {
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
          console.error("Retry failed");
          return {
            payload: null,
            status: "ERROR",
          };
        }
      }
      return {
        payload: null,
        status: "UNAUTHORIZED",
      };
    }

    // Check if it's a network error
    console.error(err);
    const isNetworkError =
      err.name === "AbortError" ||
      err.name === "TypeError" ||
      err.message === "Failed to fetch" ||
      err.status >= 500;

    if (isNetworkError) {
      return {
        payload: null,
        status: "ERROR",
        message: "Connection failed or timed out",
      };
    }

    return {
      payload: null,
      status: "ERROR",
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
