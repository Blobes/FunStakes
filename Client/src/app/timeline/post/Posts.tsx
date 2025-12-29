"use client";

import { CircularProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PostCard } from "./Post";
import { ScrollableContainer } from "@/components/Containers";
import { CreatePost } from "./CreatePost";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { usePost } from "./postHooks";
import { HourglassEmptyOutlined } from "@mui/icons-material";
import { useAppContext } from "@/app/AppContext";
import { delay } from "@/helpers/others";

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

      // IF AUTHENTICATED → FETCH FROM API
      const res = await getAllPost();
      if (res?.payload) {
        setPosts(res.payload);
        setMessage(res.message);
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
          <CircularProgress size={40} />
        </Stack>
      ) : posts.length < 1 ? (
        <Stack>
          <HourglassEmptyOutlined
            sx={{ transform: "scale(1.5)", stroke: theme.palette.gray[200] }}
          />
          <Typography variant="h6">{message}</Typography>
        </Stack>
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
