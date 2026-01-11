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
import { summarizeNum } from "@/helpers/others";
import { AuthStepper } from "@/app/auth/login/AuthStepper";
import { Empty } from "@/components/Empty";
import { Heart } from "lucide-react";

interface PostProps {
  post: Post;
  style?: GenericObject<string>;
}
export const PostCard = ({ post, style = {} }: PostProps) => {
  const theme = useTheme();
  const { authUser, loginStatus, setModalContent } = useAppContext();
  const {
    handlePostLike,
    getPendingLike,
    setPendingLike,
    clearPendingLike,
    fetchAuthor,
  } = usePost();
  const [isLiking, setLiking] = useState(false);
  const [latestPost, setLatestPost] = useState<Post>(post);
  const [author, setAuthor] = useState<IUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    authorId,
    content,
    postImage,
    createdAt,
    likedByMe,
    likeCount,
    status,
  } = latestPost;
  const userId = authUser?._id ?? "";

  // Fetch Author
  const handleAuthor = useCallback(async () => {
    if (!authorId) return;
    const res = await fetchAuthor(authorId);
    if (res) setAuthor(res);
    else setMessage("Failed to load author");
  }, [authorId]);

  // Reconcile pending likes + author
  useEffect(() => {
    handleAuthor();

    const pending = getPendingLike(post._id);
    if (pending !== null) {
      setLatestPost((prev) => {
        if (prev.likedByMe === pending) return prev;
        return {
          ...prev,
          likedByMe: pending,
          likeCount: pending
            ? prev.likeCount + 1
            : Math.max(0, prev.likeCount - 1),
        };
      });
    }
  }, [post._id, handleAuthor]);

  // Like Handler
  const handleLike = async () => {
    if (!authUser || loginStatus !== "AUTHENTICATED") {
      setModalContent({ content: <AuthStepper /> });
      return;
    }
    // Optimistically update
    setLatestPost((prev) => ({
      ...prev,
      likedByMe: !prev.likedByMe,
      likeCount: prev.likedByMe ? prev.likeCount - 1 : prev.likeCount + 1,
    }));
    setPendingLike(post._id, !likedByMe);
    setLiking(true);

    // Sync like on server
    try {
      const payload = await handlePostLike(post._id);
      if (payload) {
        setLatestPost((prev) => ({
          ...prev,
          likedByMe: payload.likedByMe,
          likeCount: payload.likeCount,
        }));
        clearPendingLike(post._id);
      }
    } catch (err) {
      clearPendingLike(post._id);
    } finally {
      setTimeout(() => setLiking(false), 200);
    }
  };

  // ✅ Early return
  if (!author)
    return (
      <Empty
        tagline={message || "Loading author..."}
        style={{
          container: {
            margin: theme.boxSpacing(8, 8, 0, 8),
          },
        }}
      />
    );

  const authorFullName = author ? `${author.firstName} ${author.lastName}` : "";

  return status === "DELETED" ? (
    <Empty
      tagline={"This post has been deleted by the author."}
      style={{
        container: {
          margin: theme.boxSpacing(8, 8, 0, 8),
        },
      }}
    />
  ) : (
    <Card
      sx={{
        backgroundColor: "unset",
        backgroundImage: "unset",
        borderRadius: "unset",
        padding: theme.boxSpacing(6, 0),
        display: "flex",
        flexDirection: "column",
        gap: theme.gap(4),
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
            {createdAt.toString()}
          </Typography>
        }
      />

      {/* Content */}
      <CardContent sx={{ padding: theme.boxSpacing(0, 8) }}>
        <Typography variant="body2">{content}</Typography>
      </CardContent>

      {/* Media */}
      {postImage && postImage !== "" && (
        <CardMedia component="img" image={postImage} alt="Post image" />
      )}

      {/* Actions */}
      <CardActions sx={{ padding: theme.boxSpacing(0, 4) }} disableSpacing>
        <Stack direction="row" gap={theme.gap(2)} width="100%">
          <IconButton
            sx={{
              padding: theme.boxSpacing(4),
              borderRadius: theme.radius[3],
            }}
            onClick={handleLike}>
            <Heart
              style={{
                width: 22,
                marginRight: theme.boxSpacing(2),
                ...(isLiking && { animation: `${heartBeat} 0.3s linear` }),
                fill: likedByMe ? red[500] : "none",
                stroke: likedByMe
                  ? red[500]
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
