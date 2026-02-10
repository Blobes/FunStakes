"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useGlobalContext } from "@/app/GlobalContext";
import { GenericObject } from "@/types";
import { usePostService } from "../services";
import { Post } from "@/types";
import { summarizeNum } from "@/helpers/numberSum";
import { LoginStepper } from "@/app/(auth)/login/LoginStepper";
import { Empty } from "@/components/Empty";
import { useSnackbar } from "@/hooks/snackbar";
import { useController } from "@/hooks/global";
import { Strip } from "@/components/StripBar";
import { multiMediaData, singleMediaData } from "@/data/postData";
import { PostMedia } from "./PostMedia";
import { usePostAuthor } from "../hooks/usePostAuthor";
import { usePostLike } from "../hooks/usePostLike";
import { PostHeader } from "./PostHeader";
import { PostEngagement } from "./PostEngagement";

interface PostProps {
    post: Post;
    style?: GenericObject<string>;
    mode?: "online" | "offline"
}

export const PostCard = ({ post, style = {}, mode = "online" }: PostProps) => {
    const theme = useTheme();
    const postService = usePostService(); // Hook containing fetchAuthor, handlePostLike, etc.
    const globalContext = useGlobalContext();
    const controller = useController();
    const { setSBMessage } = useSnackbar();

    // 1. Splitted Logic Hooks
    const { author, error } = usePostAuthor(post.authorId, postService.fetchAuthor);

    const { postData, isLiking, handleLike } = usePostLike(post, {
        ...postService, ...globalContext, ...controller, setSBMessage,
        mode, LoginStepper: <LoginStepper />
    });
    const { likeCount, likedByMe, content } = postData;
    const postMedia = singleMediaData

    if (!author) return <Empty tagline={error || "Loading author..."} />;
    if (postData.status === "DELETED") return <Empty tagline="Deleted by author." />;

    return (
        <Stack
            sx={{
                backgroundColor: "unset",
                backgroundImage: "unset",
                borderRadius: "unset",
                display: "flex",
                flexDirection: "column",
                gap: theme.gap(0),
                flexGrow: "0",
                flexShrink: "0",
                borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
                ...style,
            }}>
            <PostHeader author={author} createdAt={postData.createdAt} />

            {/* Post content */}
            <Typography variant="body2" sx={{
                padding: theme.boxSpacing(6, 0),
                [theme.breakpoints.down("md")]: {
                    padding: theme.boxSpacing(6),
                }
            }}>
                {content}
            </Typography>

            {postMedia && <PostMedia mediaList={postMedia} />}

            {/* Info Strip */}
            <Strip
                items={[
                    {
                        text: likeCount > 1 ? "Likes" : "Like",
                        element: (
                            <strong style={{ color: theme.palette.gray[300] as string }}>
                                {summarizeNum(likeCount)}
                            </strong>
                        ),
                    },
                    {
                        text: 1500 > 1 ? "Replies" : "Reply",
                        element: (
                            <strong style={{ color: theme.palette.gray[300] as string }}>
                                {summarizeNum(1500)}
                            </strong>
                        ),
                    },
                    {
                        text: 20000 > 1 ? " Views" : " View",
                        element: (
                            <strong style={{ color: theme.palette.gray[300] as string }}>
                                {summarizeNum(20000)}
                            </strong>
                        ),
                    },
                ]}
                style={{
                    padding: theme.boxSpacing(4, 0),
                    [theme.breakpoints.down("md")]: {
                        padding: theme.boxSpacing(4, 6),
                    },
                    borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
                    fontSize: "14px"
                }}
            />

            <PostEngagement
                likedByMe={likedByMe}
                isLiking={isLiking}
                handleLike={handleLike}
            />
        </Stack>
    );
};