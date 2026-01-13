"use client";

import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PostCard } from "./PostCard";
import { ScrollableContainer } from "@/components/Containers";
import { CreatePost } from "./CreatePost";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { usePost } from "./postHooks";
import { useAppContext } from "@/app/AppContext";
import { delay } from "@/helpers/others";
import { ProgressIcon } from "@/components/Loading";
import { Empty } from "@/components/Empty";
import { useRouter } from "next/navigation";
import { RadioTower } from "lucide-react";

export const Posts = () => {
  const theme = useTheme();
  const { getAllPost } = usePost();
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const { loginStatus } = useAppContext();
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const renderPosts = async () => {
    try {
      setLoading(true);
      await delay();
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
          <ProgressIcon otherProps={{ size: 30 }} />
        </Stack>
      ) : posts.length < 1 ? (
        <Empty
          tagline={message || "Something went wrong, check your network"}
          icon={<RadioTower />}
          cta={{
            type: "ICON",
            toolTip: "Refresh",
            action: () => router.refresh(),
          }}
          style={{
            container: {
              height: "100%",
              backgroundColor: "none",
            },
            tagline: { fontSize: "18px" },
            icon: {
              width: "60px",
              height: "60px",
              svg: {
                fill: "none",
                stroke: theme.palette.gray[200],
                strokeWidth: "1.5px",
              },
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
