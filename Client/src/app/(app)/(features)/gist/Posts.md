"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PostCard } from "./post-card/Card";
import { CreatePost } from "./CreatePost";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Post } from "@/types";
import { usePostService } from "./services";
import { delay } from "@/helpers/global";
import { ProgressIcon } from "@/components/LoadingUIs";
import { Empty } from "@/components/Empty";
import { useRouter } from "next/navigation";
import { Milestone } from "lucide-react";
import { useStyles } from "@/hooks/style";
import { cachePosts } from "@/helpers/post";

export const Posts = () => {
  const theme = useTheme();
  const { getAllPost } = usePostService();
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const { autoScroll } = useStyles();

  // STABILIZE: The fetcher function is now locked
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

  // STABILIZE: Only runs once on mount. Resizing won't touch this.
  useEffect(() => {
    renderPosts();
  }, []);

  // STABILIZE: Styles are calculated once unless dependencies change
  const containerStyle = useMemo(() => ({
    width: "100%",
    height: "100%",
    minWidth: "400px",
    gap: theme.gap(8),
    padding: theme.boxSpacing(8, 24),
    ...(posts.length > 1 && autoScroll().base),

    [theme.breakpoints.down("md")]: {
      border: "none",
      maxWidth: "unset",
      minWidth: "unset",
      padding: theme.boxSpacing(0),
      ...(!isLoading && autoScroll().mobile),
    },
  }), [theme, posts.length, isLoading, autoScroll]);

  return (
    <Stack sx={containerStyle}>
      <CreatePost />
      {isLoading ? (
        <Stack
          sx={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <ProgressIcon otherProps={{ size: 24 }} />
        </Stack>
      ) : posts.length < 1 ? (
        <Empty
          tagline={message || "Something went wrong, check your network"}
          icon={<Milestone />}
          primaryCta={{
            type: "BUTTON",
            variant: "outlined",
            label: "Refresh",
            action: () => router.refresh(),
          }}
          style={{
            container: {
              height: "100%",
              backgroundColor: "none",
              gap: theme.gap(6)
            },
            tagline: { fontSize: "16px" },
            icon: {
              width: "50px",
              height: "50px",
              [theme.breakpoints.down("md")]: {
                width: "40px",
                height: "40px",
              },
              svg: {
                fill: "none",
                stroke: theme.palette.gray[200],
                strokeWidth: "1.5px",
              },
            },
          }}
        />
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </Stack>
  );
};