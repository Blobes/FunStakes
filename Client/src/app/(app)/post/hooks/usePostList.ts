import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/types";
import { usePostService } from "../services";
import { cachePosts } from "@/helpers/post";
import { delay } from "@/helpers/global";

export const usePostList = () => {
  const router = useRouter();
  const { getAllPost } = usePostService();

  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const renderPosts = useCallback(async () => {
    try {
      setLoading(true);
      await delay();
      const res = await getAllPost();
      if (res?.payload) {
        setPosts(res.payload);
        setMessage(res.message);
        cachePosts(res.payload);
      }
    } finally {
      setLoading(false);
    }
  }, [getAllPost]);

  useEffect(() => {
    renderPosts();
  }, [renderPosts]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    posts,
    message,
    isLoading,
    handleRefresh,
  };
};
