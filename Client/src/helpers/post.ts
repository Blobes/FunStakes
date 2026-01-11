"use client";

import { fetcher } from "./fetcher";

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
export const enqueueLike = (postId: string, liked: boolean) => {
  const queue = JSON.parse(localStorage.getItem(likeQueueKey) || "[]");
  queue.push({
    postId,
    action: liked ? "LIKE" : "UNLIKE",
    timestamp: Date.now(),
  });
  localStorage.setItem(likeQueueKey, JSON.stringify(queue));
};

export const processQueue = async () => {
  const queue = JSON.parse(localStorage.getItem("likeQueue") || "[]");
  if (!queue.length) return;

  const latestIntent = new Map<string, "LIKE" | "UNLIKE">();

  for (const item of queue) {
    latestIntent.set(item.postId, item.action);
  }

  const remaining: any[] = [];

  for (const [postId, action] of Array.from(latestIntent.entries())) {
    try {
      await fetcher(`/posts/${postId}/like`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      });
    } catch {
      remaining.push({ postId, action, timestamp: Date.now() });
    }
  }

  localStorage.setItem("likeQueue", JSON.stringify(remaining));
};
