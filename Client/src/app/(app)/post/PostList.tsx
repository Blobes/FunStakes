"use client";

import { Stack } from "@mui/material";
import { PostCard } from "./post-card/Card";
import { CreatePost } from "./CreatePost";
import { ProgressIcon } from "@/components/LoadingUIs";
import { Empty } from "@/components/Empty";
import { Milestone } from "lucide-react";
import { usePostList } from "./hooks/usePostList";
import { useMemo } from "react";
import { useStyles } from "@/hooks/style";
import { useTheme } from "@mui/material/styles";


export const PostList = () => {
    const theme = useTheme();
    const { posts, message, isLoading, handleRefresh } = usePostList();
    const { autoScroll } = useStyles();

    const containerStyle = useMemo(
        () => ({
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
        }),
        [theme, posts.length, isLoading, autoScroll],
    );

    return (
        <Stack sx={containerStyle}>
            <CreatePost />

            {isLoading ? (
                <Stack sx={{
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center"
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
                        action: handleRefresh,
                    }}
                    style={{
                        container: {
                            height: "100%",
                            backgroundColor: "none",
                            gap: theme.gap(6)
                        },
                        tagline: { fontSize: "16px" },
                        icon: {
                            width: "50px", height: "50px",
                            [theme.breakpoints.down("md")]: {
                                width: "40px", height: "40px"
                            },
                            svg: {
                                fill: "none",
                                stroke: theme.palette.gray[200],
                                strokeWidth: "1.5px"
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