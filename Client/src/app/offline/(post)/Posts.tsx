"use client";

import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { Post } from "@/types";
import { useGlobalContext } from "@/app/GlobalContext";
import { delay } from "@/helpers/global";
import { ProgressIcon } from "@/components/LoadingUIs";
import { Empty } from "@/components/Empty";
import { useRouter } from "next/navigation";
import { CircleSlash2, RadioTower } from "lucide-react";
import { useStyles } from "@/hooks/style";
import { PostCard } from "./PostCard";
import { getCachedPosts } from "@/helpers/post";
import { usePage } from "@/hooks/page";
import { clientRoutes } from "@/helpers/routes";

export const Posts = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const { authStatus } = useGlobalContext();
  const [isLoading, setLoading] = useState(false);
  const { navigateTo } = usePage();
  const { autoScroll } = useStyles();

  const renderPosts = async () => {
    try {
      setLoading(true);
      await delay();
      const cachedPosts = await getCachedPosts();
      if (cachedPosts) setPosts(cachedPosts);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    renderPosts();
  }, [authStatus]);

  return (
    <Stack
      sx={{
        borderRight: `1px solid ${theme.palette.gray.trans[1]}`,
        width: "100%",
        height: "100%",
        minWidth: "400px",
        gap: "unset",
        padding: theme.boxSpacing(0),
        ...(posts.length > 1 && autoScroll().base),

        [theme.breakpoints.down("md")]: {
          border: "none",
          maxWidth: "unset",
          minWidth: "unset",
          ...(!isLoading && autoScroll().mobile),
        },
      }}>
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
          headline="No offline posts"
          tagline="Can't find any post at this time."
          icon={<CircleSlash2 />}
          primaryCta={{
            type: "BUTTON",
            variant: "outlined",
            label: "Explore Funstakes",
            action: () => navigateTo(clientRoutes.about,
              { type: "element", savePage: false, loadPage: true }),
          }}
          style={{
            container: {
              height: "100%",
              backgroundColor: "none",
            },
            tagline: { fontSize: "15px" },
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
