"use client";

import {
  Stack,
  Card,
  Typography,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useGlobalContext } from "@/app/GlobalContext";
import { UserAvatar } from "@/components/UserAvatar";
import { GenericObject, IUser } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { pulse } from "@/helpers/animations";
import { usePostService } from "../services";
import { Post } from "@/types";
import { red } from "@mui/material/colors";
import { summarizeNum } from "@/helpers/numberSum";
import { LoginStepper } from "@/app/(auth)/login/LoginStepper";
import { Empty } from "@/components/Empty";
import { EllipsisVertical, Heart, Send, UserPlus, Bookmark, MessageCircle } from "lucide-react";
import { useSnackbar } from "@/hooks/snackbar";
import { useController } from "@/hooks/global";
import { AnimatedWrapper } from "@/components/AnimationWrapper";
import { Strip } from "@/components/StripBar";
import { SmartDate } from "@/components/SmartDate";
import { SingleMediaProps, SingleMedia } from "@/components/media/SingleMedia";
import { vibrate } from "@/helpers/global";
import { cacheAuthor } from "@/helpers/post";
import { multiMediaData, singleMediaData } from "@/data/postData";
import { PostMedia } from "./PostMedia";

interface PostProps {
  post: Post;
  style?: GenericObject<string>;
}

export const PostCard = ({ post, style = {} }: PostProps) => {
  const theme = useTheme();
  const { authStatus, setDrawerContent: setModalContent } = useGlobalContext();
  const { isOffline, isUnstableNetwork } = useController();
  const {
    handlePostLike,
    fetchAuthor,
    getPendingLike,
    setPendingLike,
    clearPendingLike,
  } = usePostService();
  const [postData, setPostData] = useState<Post>(post);
  const [author, setAuthor] = useState<IUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const { setSBMessage } = useSnackbar();

  const { _id, authorId, content, postImage, createdAt,
    status, likeCount, likedByMe,
  } = postData;

  // Fetch author once
  const handleAuthor = useCallback(async () => {
    if (!authorId || author) return; // Preservation of logic + skip if already exists
    try {
      const res = await fetchAuthor(authorId);
      if (res) {
        setAuthor(res);
        cacheAuthor(res);
      } else {
        setMessage("Failed to load author")
      };
    } catch {
      setMessage("Failed to load author");
    }
  }, [authorId, fetchAuthor, author]);

  // Hydrate pending like from localStorage once
  useEffect(() => {
    handleAuthor();

    const pendingLike = getPendingLike(_id);
    if (pendingLike !== null && pendingLike !== likedByMe) {
      setPostData((prev) => ({
        ...prev,
        likedByMe: pendingLike,
        likeCount: prev.likeCount + (pendingLike ? 1 : -1),
      }));
    }
  }, [_id, handleAuthor, getPendingLike, likedByMe]);

  // Handle like/unlike
  const handleLike = useCallback(async () => {
    if (authStatus === "UNAUTHENTICATED") {
      setModalContent({ content: <LoginStepper /> });
      return;
    }
    if (isOffline || isUnstableNetwork) {
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
    // Optimistic update
    setPostData((prev) => {
      const nextLiked = !prev.likedByMe;
      const nextCount = prev.likeCount + (nextLiked ? 1 : -1);
      // persist pending like
      setPendingLike(_id, nextLiked);
      return { ...prev, likedByMe: nextLiked, likeCount: nextCount };
    });
    if (!likedByMe) vibrate() // Vibrate on like

    try {
      const payload = await handlePostLike(_id, !likedByMe); // pass state to backend
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
  }, [_id, authStatus, isOffline, isUnstableNetwork, handlePostLike, likedByMe,
    setPendingLike, clearPendingLike, setSBMessage, setModalContent]);

  if (!author)
    return (
      <Empty
        tagline={message || "Loading author..."}
        style={{
          container: {
            [theme.breakpoints.down("md")]: {
              margin: theme.boxSpacing(0, 6)
            }
          }
        }}
      />
    );

  if (status === "DELETED")
    return (
      <Empty
        tagline="This post has been deleted by the author."
      />
    );

  const authorFullName = `${author.firstName} ${author.lastName}`;
  const postMedia = singleMediaData // ?? multiMediaData 


  return (
    <Card
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
      {/* Post Header */}
      <Stack direction="row"
        sx={{
          alignItems: "flex-start",
          gap: theme.gap(1),
          [theme.breakpoints.down("md")]: {
            padding: theme.boxSpacing(0, 2, 0, 4),
          }
        }}>
        <UserAvatar
          userInfo={{
            firstName: author.firstName,
            lastName: author.lastName,
            profileImage: author.profileImage,
          }}
          style={{ width: "32px", height: "32px", fontSize: "16px" }}
          aria-label={authorFullName}
        />
        <Stack sx={{ width: "100%", gap: theme.gap(0), minWidth: "40px" }}>
          <Typography variant="body2" noWrap={true} sx={{ fontWeight: "bold" }}>
            {authorFullName}
          </Typography>
          <Typography variant="body3" noWrap={true} sx={{
            color: theme.palette.gray[200],
            lineHeight: "1.1em"
          }}>
            @{author.username}
          </Typography>
        </Stack>

        {/* Right side */}
        <Stack direction="row" sx={{
          alignItems: "center",
          gap: 0,
          [theme.breakpoints.down("md")]: {
            gap: theme.gap(4),
          }
        }}>
          {/* Date & time */}
          <SmartDate variant="body3" timestamp={createdAt}
            sx={{
              width: "fit-content",
              color: theme.palette.gray[200],
              padding: theme.boxSpacing(0, 4),
              fontWeight: "600",
              flex: "none",
              [theme.breakpoints.down("md")]: {
                padding: theme.boxSpacing(0, 2),
              }
            }} />

          {/* Follow user icon */}
          <IconButton sx={{
            padding: theme.boxSpacing(2.5),
            borderRadius: theme.radius.full,
            [theme.breakpoints.down("md")]: {
              padding: theme.boxSpacing(0),
            }
          }}>
            <UserPlus style={{
              stroke: theme.palette.gray[200],
            }} size={20} />
          </IconButton>

          {/* More action icon */}
          <IconButton sx={{
            padding: theme.boxSpacing(2.5),
            borderRadius: theme.radius.full,
            [theme.breakpoints.down("md")]: {
              padding: theme.boxSpacing(0),
            }
          }}>
            <EllipsisVertical style={{
              stroke: theme.palette.gray[200],
            }} size={20} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Content text */}
      <Typography variant="body2"
        sx={{
          padding: theme.boxSpacing(6, 0),
          [theme.breakpoints.down("md")]: {
            padding: theme.boxSpacing(6),
          }
        }}>
        {content}
      </Typography>

      {/* Content media */}
      {postMedia && (
        <PostMedia mediaList={postMedia} />
      )}

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
          padding: theme.boxSpacing(4),
          borderTop: `1px solid ${theme.palette.gray.trans[1]}`,
          borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
          fontSize: "14px"
        }}
      />

      {/* Engagement Icons */}
      <Stack direction="row" sx={{
        padding: theme.boxSpacing(6, 0),
        [theme.breakpoints.down("md")]: {
          padding: theme.boxSpacing(4),
        }
      }}>
        <Stack sx={{
          flexDirection: "row",
          gap: theme.gap(6),
          width: "100%",
          alignItems: "center",
          "& > button:hover": {
            transform: "scale(1.08)",
            transition: "transform 0.3s ease-in-out",
            background: "none",
          }
        }} >
          {/* Like */}
          <IconButton
            sx={{
              padding: theme.boxSpacing(0),
              borderRadius: theme.radius[0],
            }}
            onClick={handleLike}>
            <AnimatedWrapper sx={{
              ...(isLiking && { animation: `${pulse()} 0.3s linear ` }),
            }}>
              <Heart
                size={26}
                style={{
                  fill: likedByMe ? red[500] : "none",
                  stroke: postData.likedByMe
                    ? (red[500] as string)
                    : (theme.palette.gray[200] as string),
                }}
              />
            </AnimatedWrapper>
          </IconButton>

          {/* Comments */}
          <IconButton sx={{ padding: theme.boxSpacing(0), borderRadius: theme.radius[0] }}>
            <MessageCircle size={24} />
          </IconButton>

          {/* Share */}
          <IconButton sx={{ padding: theme.boxSpacing(0), borderRadius: theme.radius[0] }}>
            <Send size={24} />
          </IconButton>
        </Stack>

        {/* Bookmark */}
        <IconButton
          sx={{
            padding: theme.boxSpacing(0),
            borderRadius: theme.radius[0],
            "&:hover": {
              transform: "scale(1.08)",
              transition: "transform 0.3s ease-in-out",
              background: "none",
            }
          }}>
          <Bookmark size={24}
          />
        </IconButton>
      </Stack>
    </Card>
  );
};