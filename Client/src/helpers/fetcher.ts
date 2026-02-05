"use client";

import { IUser } from "@/types";
import { serverRoutes } from "./routes";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TIMEOUT = 60000; // Default timeout in milliseconds

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
      credentials: "include",
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let message = "Something went wrong";
      try {
        const errorData = await response.json();
        message = errorData?.message ?? message;
      } catch {
        message =
          response.statusText || `Request failed with ${response.status}`;
      }
      const error = new Error(message) as any;
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    // AbortError name is standard; when abort("timeout") is used,
    // some envs set message to "timeout" but not name
    const isAbortOrTimeout =
      error?.name === "AbortError" || error?.message === "timeout";
    if (isAbortOrTimeout) {
      const timeoutErr = new Error("Connection timed out or failed.");
      (timeoutErr as any).status = 0;
      throw timeoutErr;
    }

    if (error.message === "Failed to fetch" || error instanceof TypeError) {
      error.status = 0;
      throw error;
    }

    // Ensure every thrown error has a status so callers can branch (e.g. 401 vs network)
    if (typeof (error as any).status !== "number") {
      (error as any).status = 0;
    }
    throw error;
  }
};

interface TokenCheckResponse {
  payload: IUser | null;
  message?: string;
  status?: "SUCCESS" | "UNAUTHORIZED" | "ERROR" | "UNKNOWN";
}
export const fetchUserWithTokenCheck =
  async (): Promise<TokenCheckResponse> => {
    try {
      const res = await fetcher<{ user: IUser }>(serverRoutes.verifyAuthToken);
      return { payload: res.user, status: "SUCCESS" };
    } catch (err: any) {
      const status = typeof err?.status === "number" ? err.status : undefined;

      // Catch 401 (Missing/Expired) OR 403 (Invalid)
      if (status === 401 || status === 403) {
        // Try to refresh once
        const refreshed = await refreshAccessToken();
        if (refreshed) {
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

      // Check if it's a network error (incl. timeout, unknown;
      //  fetcher sets status 0 for these)
      console.error(err);
      const isNetworkError =
        status === undefined ||
        status === 0 ||
        status >= 500 ||
        err.name === "AbortError" ||
        err.name === "TypeError" ||
        err.message === "Failed to fetch" ||
        err.message === "Connection timed out or failed.";

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
