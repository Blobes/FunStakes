"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useGlobalContext } from "@/app/GlobalContext";
import { GenericObject, UIMode } from "@/types";
import { useGistService } from "../service";
import { IGist } from "@/types";
import { summarizeNum } from "@/helpers/numberSum";
import { LoginStepper } from "@/app/(auth)/login/LoginStepper";
import { Empty } from "@/components/Empty";
import { useSnackbar } from "@/hooks/snackbar";
import { useController } from "@/hooks/global";
import { Strip } from "@/components/StripBar";
import { multiMediaData, singleMediaData } from "@/test-data/postData";
import { GistMedia } from "./GistMedia";
import { useGistAuthor } from "../hooks/useGistAuthor";
import { useGistLike } from "../hooks/useGistLike";
import { GistHeader } from "./GistHeader";
import { GistEngagement } from "./GistEngagement";
import { DoubleTapLike } from "@/components/DoubleTapLike";

interface GistProps {
    gist: IGist;
    style?: GenericObject<string>;
    mode?: UIMode
}

export const GistCard = ({ gist, style = {}, mode = "online" }: GistProps) => {
    const theme = useTheme();
    const postService = useGistService();
    const globalContext = useGlobalContext();
    const controller = useController();
    const { setSBMessage } = useSnackbar();

    // Author hooks & properties
    const { author, error } = useGistAuthor(gist.authorId, postService.fetchAuthor, mode);

    // Like hooks & properties
    const { gistData, isLiking, handleLike } = useGistLike(gist, {
        ...postService, ...globalContext, ...controller, setSBMessage,
        mode, LoginStepper: <LoginStepper />
    });
    const { likeCount, likedByMe, content } = gistData;
    const postMedia = singleMediaData

    if (!author) return <Empty tagline={error || "Loading author..."} />;
    if (gistData.status === "DELETED") return <Empty tagline="Deleted by author." />;

    return (
        <Stack
            sx={{
                gap: theme.gap(0),
                flexGrow: "0",
                flexShrink: "0",
                borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
                ...style,
            }}>
            <GistHeader author={author} createdAt={gistData.createdAt} />

            {/* Gist content */}
            <Typography variant="body2" sx={{
                padding: theme.boxSpacing(6, 0),
                [theme.breakpoints.down("md")]: {
                    padding: theme.boxSpacing(6),
                }
            }}>{content}</Typography>

            {/* Gist media */}
            {postMedia && <GistMedia mediaList={postMedia}
                likedByMe={likedByMe} handleLike={handleLike} />}

            {/* Gist info strip */}
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

            {/* Gist engagement  */}
            <GistEngagement
                likedByMe={likedByMe}
                isLiking={isLiking}
                handleLike={handleLike}
                mode={mode}
            />
        </Stack>
    );
};