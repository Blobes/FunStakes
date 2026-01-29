"use client";

import { IUser } from "@/types";
import { serverRoutes } from "./routes";

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
      throw new Error("Failed to fetch");
    }
    throw error;
  }
};

interface TokenCheckResponse {
  payload: IUser | null;
  message?: string;
  status?: "SUCCESS" | "UNAUTHORIZED" | "ERROR";
}

export const fetchUserWithTokenCheck = async (
  attempt = 0,
): Promise<TokenCheckResponse> => {
  try {
    const res = await fetcher<{ user: IUser }>(serverRoutes.verifyAuthToken);
    return { payload: res.user, status: "SUCCESS" };
  } catch (err: any) {
    // Check if it's a network/timeout error
    const isTimeout = err.name === "AbortError";
    const hasResponse = err.status !== undefined && err.status !== null;
    const isFetchFailed =
      (err.message === "Failed to fetch" || err.name === "TypeError") &&
      !hasResponse;
    const isServerError = err.status >= 500;

    if (isFetchFailed || isTimeout || isServerError) {
      // If it was an Abort but NOT a timeout, it's just a UI lifecycle event (ignore it)
      if (isTimeout && err.reason !== "timeout") {
        return { payload: null, status: "ERROR" };
      }
      return {
        payload: null,
        status: "ERROR",
        message: isTimeout ? "Request timed out." : "Network is unstable.",
      };
    }

    // 1. Stop the loop if we've tried 2 times
    if (attempt >= 2) {
      console.error("Stopping infinite refresh loop.");
      return {
        payload: null,
        status: "UNAUTHORIZED",
        message: "Session expired. Please log in again.",
      };
    }

    let msg = err.message;
    // 2. Catch 401 (Missing/Expired) OR 403 (Invalid)
    if (err.status === 401 || err.status === 403) {
      // console.log(`Attempt ${attempt + 1}: Triggering Refresh...`);
      const refreshed = await refreshAccessToken();
      msg = null;
      if (refreshed) {
        return fetchUserWithTokenCheck(attempt + 1);
      }
    }

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
