"use client";

import { fetcher } from "./fetcher";
import { serverApi } from "./routes";
import { IUser, Post } from "@/types";
import { get, set } from "idb-keyval";

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

// CACHING POSTS
interface CachePost {
  post: Post;
  lastViewed: Date;
}

export const cachePosts = async (newPosts: Post[]) => {
  const now = new Date();
  const DAY_IN_MS = 1000 * 60 * 60 * 24;

  // 1. Retrieve current cache
  const savedPosts = ((await get("user-posts")) as CachePost[]) || [];
  const authorDictionary = (await get("cached-authors")) || {};

  // 2. Filter existing posts (7-day rule)
  const filteredSavedPosts = savedPosts.filter((item) => {
    const lastViewed = new Date(item.lastViewed);
    const diffInDays = Math.floor(
      (now.getTime() - lastViewed.getTime()) / DAY_IN_MS,
    );
    return diffInDays <= 7;
  });

  // 3. Merge old fresh posts with new fetch
  const postMap = new Map<string, CachePost>();
  filteredSavedPosts.forEach((item) => postMap.set(item.post._id, item));

  newPosts.forEach((post) => {
    postMap.set(post._id, { post, lastViewed: new Date() });
  });

  const finalPosts = Array.from(postMap.values());

  // 4. AUTHOR CLEANUP (The "Sweep" Logic)
  // Create a Set of all author IDs that have at least one post in the final list
  const activeAuthorIds = new Set(finalPosts.map((item) => item.post.authorId));

  // Get all IDs currently in the author cache
  const cachedAuthorIds = Object.keys(authorDictionary);

  cachedAuthorIds.forEach((id) => {
    // If an author in the cache is NOT linked to any current post, delete them
    if (!activeAuthorIds.has(id)) {
      delete authorDictionary[id];
    }
  });

  // 5. Save back to IndexedDB
  await Promise.all([
    set("user-posts", finalPosts),
    set("cached-authors", authorDictionary),
  ]);
};

export const getCachedPosts = async (): Promise<Post[]> => {
  try {
    const cachedData = (await get("user-posts")) as CachePost[] | undefined;

    if (!cachedData || !Array.isArray(cachedData)) {
      return [];
    }
    // Sort and map to return just the Post objects
    return cachedData
      .sort((a, b) => {
        // Ensure we compare timestamps correctly
        const timeA = new Date(a.lastViewed).getTime();
        const timeB = new Date(b.lastViewed).getTime();
        return timeB - timeA; // Descending order (newest first)
      })
      .map((item) => item.post);
  } catch (error) {
    console.error("Error retrieving offline posts:", error);
    return [];
  }
};

export const cacheAuthor = async (author: IUser) => {
  if (!author || !author._id) return;

  try {
    // 1. Get the existing dictionary or initialize an empty object
    const cachedAuthors = (await get("cached-authors")) || {};

    // 2. Add/Update the author using their ID as the key
    cachedAuthors[author._id] = author;

    // 3. Save back to IndexedDB
    await set("cached-authors", cachedAuthors);
  } catch (error) {
    console.error("Failed to cache author:", error);
  }
};

export const getCachedAuthor = async (
  authorId: string,
): Promise<IUser | null> => {
  if (!authorId) return null;

  try {
    // 1. Fetch the entire dictionary from IndexedDB
    const cachedAuthors = await get<Record<string, IUser>>("cached-authors");
    // 2. Return the specific author or null if they don't exist
    return (cachedAuthors && cachedAuthors[authorId]) || null;
  } catch (error) {
    console.error(`Error fetching author ${authorId} from cache:`, error);
    return null;
  }
};
