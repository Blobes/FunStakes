"use client";

import { fetcher } from "./fetcher";
import { serverApi } from "./routes";

// POST LIKE HANDLING HELPERS
const pendingLikesKey = "pendingLikes";
const likeQueueKey = "likeQueue";
// --- Pending likes ---
export const setPendingLike = (postId: string, liked: boolean) => {
  const pending = JSON.parse(localStorage.getItem(pendingLikesKey) || "{}");
  pending[postId] = liked;
  localStorage.setItem(pendingLikesKey, JSON.stringify(pending));
};

export const getPendingLike = (postId: string): boolean | null => {
  const pending = JSON.parse(localStorage.getItem(pendingLikesKey) || "{}");
  return pending[postId] ?? null;
};

export const clearPendingLike = (postId: string) => {
  const pending = JSON.parse(localStorage.getItem(pendingLikesKey) || "{}");
  delete pending[postId];
  localStorage.setItem(pendingLikesKey, JSON.stringify(pending));
};
// --- Offline queue ---
export const enqueueLike = (postId: string, finalState: boolean) => {
  const queue = JSON.parse(localStorage.getItem(likeQueueKey) || "{}");
  // Overwrites any previous pending action for this specific post
  queue[postId] = { liked: finalState, timestamp: Date.now() };
  localStorage.setItem(likeQueueKey, JSON.stringify(queue));
};

export const processQueue = async () => {
  const queue = JSON.parse(localStorage.getItem(likeQueueKey) || "{}");
  const postIds = Object.keys(queue);

  if (!postIds.length) return;

  for (const postId of postIds) {
    try {
      await fetcher(serverApi.likePost(postId), { method: "PUT" });
      // Remove from queue and pending only after success
      const currentQueue = JSON.parse(
        localStorage.getItem(likeQueueKey) || "{}",
      );
      delete currentQueue[postId];
      localStorage.setItem(likeQueueKey, JSON.stringify(currentQueue));
      clearPendingLike(postId);
    } catch (err) {
      console.error("Failed to sync offline like for:", postId);
    }
  }
};
