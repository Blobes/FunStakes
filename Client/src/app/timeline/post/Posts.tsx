"use client";

import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PostCard } from "./PostCard";
import { ScrollableContainer } from "@/components/Containers";
import { CreatePost } from "./CreatePost";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { usePost } from "./postHooks";
import { Article } from "@mui/icons-material";
import { useAppContext } from "@/app/AppContext";
import { delay } from "@/helpers/others";
import { ProgressIcon } from "@/components/Loading";
import { Empty } from "@/components/Empty";

export const Posts = () => {
  const theme = useTheme();
  const { getAllPost } = usePost();
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { loginStatus } = useAppContext();
  const [isLoading, setLoading] = useState(false);

  const renderPosts = async () => {
    try {
      setLoading(true);
      await delay();

      const res = await getAllPost();
      if (res?.payload) {
        setPosts(res.payload);
        setMessage(res.message);
        //  console.log(res.payload);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    renderPosts();
  }, [loginStatus]);

  return (
    <ScrollableContainer
      sx={{
        borderLeft: `1px solid ${theme.palette.gray.trans[1]}`,
        borderRight: `1px solid ${theme.palette.gray.trans[1]}`,
        width: "44%",
        maxWidth: "650px",
        minWidth: "400px",
      }}>
      {loginStatus === "AUTHENTICATED" && <CreatePost />}

      {isLoading ? (
        <Stack
          sx={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <ProgressIcon otherProps={{ size: 30 }} />
        </Stack>
      ) : posts.length < 1 ? (
        <Empty
          tagline={message || "Something went wrong, check your network"}
          icon={<Article />}
          style={{
            container: {
              margin: theme.boxSpacing(8, 8, 0, 8),
            },
          }}
        />
      ) : (
        <Stack
          sx={{
            gap: "unset",
            height: "fit-content",
            padding: theme.boxSpacing(0),
          }}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </Stack>
      )}
    </ScrollableContainer>
  );
};
