"use client";

import {
  Stack,
  Card,
  Typography,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { UserAvatar } from "@/components/UserAvatar";
import { GenericObject, IUser } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { pulse } from "@/helpers/animations";
import { Post } from "@/types";
import { red } from "@mui/material/colors";
import { summarizeNum } from "@/helpers/numberSum";
import { Empty } from "@/components/Empty";
import { EllipsisVertical, Heart, Send, UserPlus, Bookmark, MessageCircle } from "lucide-react";
import { useSnackbar } from "@/hooks/snackbar";
import { AnimatedWrapper } from "@/components/AnimationWrapper";
import { img } from "@/assets/exported";
import { Strip } from "@/components/StripBar";
import { SmartDate } from "@/components/SmartDate";
import { SingleMedia } from "@/components/media/SingleMedia";
import { getCachedAuthor } from "@/helpers/post";

interface PostProps {
  post: Post;
  style?: GenericObject<string>;
}

export const PostCard = ({ post, style = {} }: PostProps) => {
  const theme = useTheme();
  const [author, setAuthor] = useState<IUser | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLiking] = useState(false);
  const { setSBMessage } = useSnackbar();

  const { authorId, content, postImage, createdAt,
    status, likeCount, likedByMe,
  } = post;

  // Fetch author once
  const handleAuthor = useCallback(async () => {
    if (!authorId) return;
    try {
      const cachedAuthor = await getCachedAuthor(authorId);
      if (cachedAuthor) {
        setAuthor(cachedAuthor);
      } else {
        setMessage("Failed to load author")
      };
    } catch {
      setMessage("Failed to load author");
    }
  }, [authorId]);


  useEffect(() => {
    handleAuthor();
  }, [handleAuthor]);

  // Handle like/unlike
  const handleInteraction = async () => {
    setSBMessage({
      msg: {
        content: "You can't engage with an offline post .",
        msgStatus: "ERROR",
        behavior: "FIXED",
      },
      override: true,
    });
    return;
  }

  if (!author)
    return (
      <Empty
        tagline={message || "Loading author..."}
        style={{ container: { margin: theme.boxSpacing(6, 6, 0, 6) } }}
      />
    );

  const authorFullName = `${author.firstName} ${author.lastName}`;
  const postImg = postImage ?? img.pic

  if (status === "DELETED")
    return (
      <Empty
        tagline="This post has been deleted by the author."
        style={{ container: { margin: theme.boxSpacing(6, 6, 0, 6) } }}
      />
    );

  return (
    <Card
      sx={{
        backgroundColor: "unset",
        backgroundImage: "unset",
        borderRadius: "unset",
        padding: theme.boxSpacing(8, 0, 0, 0),
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
          padding: theme.boxSpacing(0, 10, 0, 8),
          alignItems: "flex-start",
          gap: theme.gap(1)
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

        {/* Date & time */}
        <SmartDate variant="body3" timestamp={createdAt}
          sx={{
            width: "fit-content",
            color: theme.palette.gray[200],
            marginX: theme.boxSpacing(2),
            flex: "none"
          }} />

        {/* Follow user icon */}
        <IconButton onClick={handleInteraction} sx={{
          padding: theme.boxSpacing(1),
          borderRadius: theme.radius[1],
        }}>
          <UserPlus style={{
            stroke: theme.palette.gray[200],
          }} size={18} />
        </IconButton>

        {/* More action icon */}
        <IconButton sx={{
          padding: theme.boxSpacing(1),
          borderRadius: theme.radius[1],
          marginRight: theme.boxSpacing(-3)
        }}>
          <EllipsisVertical style={{
            stroke: theme.palette.gray[200],
          }} size={18} />
        </IconButton>
      </Stack>

      {/* Content text */}
      <Typography variant="body1"
        sx={{ padding: theme.boxSpacing(4, 10) }}>
        {content}
      </Typography>
      {/* Content media */}
      {postImg && (
        <SingleMedia mediaSrc={postImg} />
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
          padding: theme.boxSpacing(4, 6),
          borderTop: `1px solid ${theme.palette.gray.trans[1]}`,
          borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
          fontSize: "14px"
        }}
      />

      {/* Actions */}
      <Stack direction="row" sx={{
        padding: theme.boxSpacing(4, 6),
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
            onClick={handleInteraction}>
            <AnimatedWrapper sx={{
              ...(isLiking && { animation: `${pulse()} 0.3s linear ` }),
            }}>
              <Heart
                size={26}
                style={{
                  fill: likedByMe ? red[500] : "none",
                  stroke: post.likedByMe
                    ? (red[500] as string)
                    : (theme.palette.gray[200] as string),
                }}
              />
            </AnimatedWrapper>
          </IconButton>

          {/* Comments */}
          <IconButton onClick={handleInteraction}
            sx={{ padding: theme.boxSpacing(0), borderRadius: theme.radius[0] }}>
            <MessageCircle size={24} />
          </IconButton>

          {/* Share */}
          <IconButton onClick={handleInteraction}
            sx={{ padding: theme.boxSpacing(0), borderRadius: theme.radius[0] }}>
            <Send size={24} />
          </IconButton>
        </Stack>

        {/* Bookmark */}
        <IconButton
          onClick={handleInteraction}
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
