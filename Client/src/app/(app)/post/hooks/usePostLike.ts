import { useState, useCallback, useEffect } from "react";
import { Post } from "@/types";
import { vibrate } from "@/helpers/global";

export const usePostLike = (post: Post, context: any) => {
  // 1. Destructure everything internally for clarity
  const {
    handlePostLike,
    getPendingLike,
    setPendingLike,
    clearPendingLike,
    authStatus,
    setModalContent,
    isOffline,
    isUnstableNetwork,
    setSBMessage,
    LoginStepper,
  } = context;
  const [postData, setPostData] = useState<Post>(post);
  const [isLiking, setIsLiking] = useState(false);

  const { _id, likedByMe } = postData;

  // Sync with localStorage on mount
  useEffect(() => {
    const pendingLike = getPendingLike(_id);
    if (pendingLike !== null && pendingLike !== likedByMe) {
      setPostData((prev) => ({
        ...prev,
        likedByMe: pendingLike,
        likeCount: prev.likeCount + (pendingLike ? 1 : -1),
      }));
    }
  }, [_id, getPendingLike, likedByMe]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;

    if (authStatus === "UNAUTHENTICATED") {
      setModalContent({ content: LoginStepper });
      return;
    }
    if (isOffline || isUnstableNetwork) {
      console.log("Hello");
      setSBMessage({
        msg: {
          content: "Something went wrong.",
          msgStatus: "ERROR",
          behavior: "FIXED",
        },
        override: true,
      });
      return;
    }

    setIsLiking(true);

    // Optimistic update
    setPostData((prev) => {
      const nextLiked = !prev.likedByMe;
      const nextCount = prev.likeCount + (nextLiked ? 1 : -1);
      // persist pending like
      setPendingLike(_id, nextLiked);
      return { ...prev, likedByMe: nextLiked, likeCount: nextCount };
    });

    if (!likedByMe) vibrate(); // Vibrate on like

    try {
      const payload = await handlePostLike(_id, !likedByMe);
      if (payload) {
        setPostData((prev) => ({
          ...prev,
          likedByMe: payload.likedByMe,
          likeCount: payload.likeCount,
        }));
        clearPendingLike(_id);
      }
    } catch {
      clearPendingLike(_id);
      // Optional: Rollback state on hard error
    } finally {
      setIsLiking(false);
    }
  }, [
    _id,
    likedByMe,
    authStatus,
    isOffline,
    isUnstableNetwork,
    handlePostLike,
    setPendingLike,
    clearPendingLike,
    setSBMessage,
    setModalContent,
    LoginStepper,
  ]);

  return { postData, isLiking, handleLike };
};
