"use client";

import { fetcher } from "@/helpers/fetcher";
import { Post, SingleResponse, ListResponse, IUser } from "@/types";
import { useCallback } from "react";
import {
  setPendingLike,
  getPendingLike,
  clearPendingLike,
  enqueueLike,
  processQueue,
} from "@/helpers/post";
import { serverApi } from "@/helpers/routes";

export const usePostService = () => {
  const getAllPost = useCallback(async (): Promise<{
    payload: Post[] | null;
    message: string;
  }> => {
    try {
      const res = await fetcher<ListResponse<Post & { likedByMe: boolean }>>(
        serverApi.posts,
        { method: "GET" },
      );
      return { payload: res.payload ?? null, message: res.message };
    } catch (error: any) {
      return {
        payload: null,
        message: error.message ?? "Something went wrong",
      };
    }
  }, []);

  // Fetch Author
  const fetchAuthor = useCallback(async (authorId: string) => {
    try {
      const res = await fetcher<SingleResponse<IUser>>(
        serverApi.user(authorId),
      );
      return res.payload;
    } catch {
      return null;
    }
  }, []);

  interface LikeResponse {
    likedByMe: boolean;
    likeCount: number;
  }

  // Handle like
  const handlePostLike = useCallback(
    async (
      postId: string,
      intendedState: boolean,
    ): Promise<LikeResponse | null> => {
      try {
        const res = await fetcher<SingleResponse<LikeResponse>>(
          serverApi.likePost(postId),
          { method: "PUT" },
        );
        return res.payload;
      } catch {
        // Pass the intended state here!
        enqueueLike(postId, intendedState);
        return null;
      }
    },
    [],
  );
  // run sync like when online + app boot
  if (typeof window !== "undefined") {
    window.addEventListener("online", processQueue);
    processQueue();
  }

  return {
    handlePostLike,
    getPendingLike,
    setPendingLike,
    clearPendingLike,
    getAllPost,
    fetchAuthor,
  };
};
