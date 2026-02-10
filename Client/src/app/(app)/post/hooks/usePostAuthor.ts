import { useState, useCallback, useEffect } from "react";
import { IUser } from "@/types";
import { cacheAuthor } from "@/helpers/post";

export const usePostAuthor = (
  authorId: string,
  fetchAuthor: (id: string) => Promise<any>,
) => {
  const [author, setAuthor] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuthor = useCallback(async () => {
    if (!authorId || author) return;
    try {
      const res = await fetchAuthor(authorId);
      if (res) {
        setAuthor(res);
        cacheAuthor(res);
      } else {
        setError("Failed to load author");
      }
    } catch {
      setError("Failed to load author");
    }
  }, [authorId, fetchAuthor, author]);

  useEffect(() => {
    handleAuthor();
  }, [handleAuthor]);

  return { author, error };
};
