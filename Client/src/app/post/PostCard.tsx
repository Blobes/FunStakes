"use client";

import {
  Stack,
  Card,
  Typography,
  IconButton,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppContext } from "@/app/AppContext";
import { UserAvatar } from "@/components/UserAvatar";
import { Share, MoreHoriz, Bookmark } from "@mui/icons-material";
import { GenericObject, IUser } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { heartBeat } from "@/helpers/animations";
import { usePost } from "./postHooks";
import { Post } from "@/types";
import { red } from "@mui/material/colors";
import { delay, getCookie, isOnline, summarizeNum } from "@/helpers/others";
import { AuthStepper } from "@/app/auth/login/AuthStepper";
import { Empty } from "@/components/Empty";
import { Heart } from "lucide-react";
import { useSharedHooks } from "@/hooks";

interface PostProps {
  post: Post;
  style?: GenericObject<string>;
}

export const PostCard = ({ post, style = {} }: PostProps) => {
  const theme = useTheme();
  const { loginStatus, setModalContent } = useAppContext();
  const {
    handlePostLike,
    fetchAuthor,
    getPendingLike,
    setPendingLike,
    clearPendingLike,
  } = usePost();
  const [postData, setPostData] = useState<Post>(post);
  const [author, setAuthor] = useState<IUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const { setSBMessage } = useSharedHooks();

  const {
    _id,
    authorId,
    content,
    postImage,
    createdAt,
    status,
    likeCount,
    likedByMe,
  } = postData;

  // Fetch author once
  const handleAuthor = useCallback(async () => {
    if (!authorId) return;
    try {
      const res = await fetchAuthor(authorId);
      if (res) setAuthor(res);
      else setMessage("Failed to load author");
    } catch {
      setMessage("Failed to load author");
    }
  }, [authorId, fetchAuthor]);

  // Hydrate pending like from localStorage once
  useEffect(() => {
    handleAuthor();

    const pending = getPendingLike(_id);
    if (pending !== null && pending !== likedByMe) {
      setPostData((prev) => ({
        ...prev,
        likedByMe: pending,
        likeCount: prev.likeCount + (pending ? 1 : -1),
      }));
    }
  }, [_id, handleAuthor]);

  // Handle like/unlike
  const handleLike = async () => {
    if (loginStatus === "UNAUTHENTICATED") {
      setModalContent({ content: <AuthStepper /> });
      return;
    }
    if (!isOnline()) {
      setSBMessage({
        msg: {
          content: "Something went wrong.",
          msgStatus: "ERROR",
          behavior: "FIXED",
        },
        override: true,
      });
      return;
    }

    setIsLiking(true);
    await delay();

    // Optimistic update
    setPostData((prev) => {
      const nextLiked = !prev.likedByMe;
      const nextCount = prev.likeCount + (nextLiked ? 1 : -1);
      // persist pending like
      setPendingLike(_id, nextLiked);
      return { ...prev, likedByMe: nextLiked, likeCount: nextCount };
    });

    try {
      const payload = await handlePostLike(_id); // pass state to backend
      if (payload) {
        // sync with server
        setPostData((prev) => ({
          ...prev,
          likedByMe: payload.likedByMe,
          likeCount: payload.likeCount,
        }));
        clearPendingLike(_id);
      }
    } catch {
      clearPendingLike(_id);
    } finally {
      setIsLiking(false);
    }
  };

  if (!author)
    return (
      <Empty
        tagline={message || "Loading author..."}
        style={{ container: { margin: theme.boxSpacing(8, 8, 0, 8) } }}
      />
    );

  const authorFullName = `${author.firstName} ${author.lastName}`;

  if (status === "DELETED")
    return (
      <Empty
        tagline="This post has been deleted by the author."
        style={{ container: { margin: theme.boxSpacing(8, 8, 0, 8) } }}
      />
    );

  return (
    <Card
      sx={{
        backgroundColor: "unset",
        backgroundImage: "unset",
        borderRadius: "unset",
        padding: theme.boxSpacing(6, 0),
        display: "flex",
        flexDirection: "column",
        gap: theme.gap(4),
        flexGrow: "0",
        flexShrink: "0",
        ...style,
      }}>
      {/* Post Header */}
      <CardHeader
        sx={{ padding: theme.boxSpacing(0, 8, 0, 4) }}
        avatar={
          <UserAvatar
            userInfo={{
              firstName: author.firstName,
              lastName: author.lastName,
              profileImage: author.profileImage,
            }}
            style={{ width: "40px", height: "40px", fontSize: "20px" }}
            aria-label={authorFullName}
          />
        }
        action={
          <IconButton>
            <MoreHoriz sx={{ fill: theme.palette.gray[200] }} />
          </IconButton>
        }
        title={
          <Typography variant="body2">
            <b>{authorFullName}</b>
          </Typography>
        }
        subheader={
          <Typography variant="body3" sx={{ color: theme.palette.gray[200] }}>
            {new Date(createdAt).toLocaleString()}
          </Typography>
        }
      />

      {/* Content */}
      <CardContent sx={{ padding: theme.boxSpacing(0, 8) }}>
        <Typography variant="body2">{content}</Typography>
      </CardContent>

      {postImage && (
        <CardMedia component="img" image={postImage} alt="Post image" />
      )}

      {/* Actions */}
      <CardActions sx={{ padding: theme.boxSpacing(0, 4) }} disableSpacing>
        <Stack direction="row" gap={theme.gap(2)} width="100%">
          <IconButton
            sx={{ padding: theme.boxSpacing(4), borderRadius: theme.radius[3] }}
            onClick={handleLike}>
            <Heart
              style={{
                width: 22,
                marginRight: theme.boxSpacing(2),
                ...(isLiking && { animation: `${heartBeat} 0.3s linear ` }),
                fill: likedByMe ? red[500] : "none",
                stroke: postData.likedByMe
                  ? (red[500] as string)
                  : (theme.palette.gray[200] as string),
              }}
            />
            <Typography variant="body2">
              <b>{summarizeNum(likeCount)}</b>
            </Typography>
          </IconButton>

          <IconButton
            sx={{
              padding: theme.boxSpacing(4),
              borderRadius: theme.radius[3],
            }}>
            <Bookmark
              sx={{
                width: 22,
                mr: theme.boxSpacing(2),
                fill: theme.palette.gray[200],
              }}
            />
            <Typography variant="body2">
              <b>12.4k</b>
            </Typography>
          </IconButton>
        </Stack>
        <IconButton>
          <Share sx={{ fill: theme.palette.gray[200] }} />
        </IconButton>
      </CardActions>
    </Card>
  );
};
