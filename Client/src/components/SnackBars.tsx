"use client";

import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSharedHooks } from "../hooks";
import { Close } from "@mui/icons-material";
import {
  fadeIn,
  fadeOut,
  moveIn,
  moveOut,
  shrinkWidth,
} from "../helpers/animations";
import { SnackBarMsg } from "@/types";
import { AppButton } from "./Buttons";
import { Info, CircleCheck, CircleAlert } from "lucide-react";

interface SnackBarProps {
  entryDir?: "LEFT" | "RIGHT";
  snackBarMsg: SnackBarMsg;
}

export const SnackBars = ({
  entryDir = "RIGHT",
  snackBarMsg,
}: SnackBarProps) => {
  const theme = useTheme();
  const { setSBTimer, removeMessage } = useSharedHooks();

  if (!snackBarMsg.messgages || snackBarMsg.messgages.length === 0) return null;

  return (
    <>
      {snackBarMsg.messgages.map((msg, i) => {
        const isTimed = msg.behavior === "TIMED";

        //Set the snackbar timer
        setSBTimer();

        const progressDur = msg.duration
          ? msg.duration
          : snackBarMsg.defaultDur;

        const boxAnimation =
          progressDur > 0
            ? `${fadeIn} 0.3s linear forwards, ${moveIn({
                dir: entryDir,
                to: "10px",
              })} 0.3s linear forwards`
            : `${fadeOut} 0.3s linear forwards, ${moveOut({
                dir: entryDir,
              })} 0.3s linear forwards`;

        const progressWidthAnim = `${shrinkWidth} ${progressDur}s linear forwards`;

        return (
          <Paper
            key={i}
            variant="elevation"
            sx={{
              position: "fixed",
              bottom: i === 0 ? "10px" : `${(10 + i) * 12}px`, // offset for multiple snackbars
              right: "10px",
              width: "94%",
              maxWidth: { sm: "400px" },
              zIndex: 1000,
              padding: theme.boxSpacing(6),
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              backgroundColor:
                msg.msgStatus === "SUCCESS"
                  ? theme.palette.info.main
                  : theme.palette.info.light,
              border: `1px solid ${theme.palette.gray.trans[2]}`,
              borderRadius: theme.radius[3],
              overflow: "hidden",
              gap: theme.gap(10),
              animation: isTimed ? boxAnimation : "none",
              "& > svg": {
                stroke: `${theme.palette.gray[300]}`,
                marginTop:
                  msg.title && msg.content && msg.cta && theme.boxSpacing(4),
                width: "24px",
                height: "24px",
              },
            }}>
            {msg.msgStatus === "SUCCESS" ? (
              <CircleCheck />
            ) : msg.msgStatus === "INFO" ? (
              <Info />
            ) : (
              <CircleAlert />
            )}

            <Stack
              sx={{
                gap: theme.gap(1),
                alignItems: "flex-start",
                width: "100%",
              }}>
              {msg.title && (
                <Typography
                  variant="body1"
                  sx={{ maxWidth: "360px", fontWeight: 600 }}>
                  {msg.title}
                </Typography>
              )}
              <Stack
                sx={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: theme.gap(1),
                }}>
                {msg.content && (
                  <Typography variant="body2">{msg.content}</Typography>
                )}
                {msg.cta && (
                  <AppButton
                    variant="text"
                    onClick={msg.cta.action}
                    style={{ display: "inline-flex" }}>
                    {msg.cta.label}
                  </AppButton>
                )}
              </Stack>
            </Stack>

            {msg.hasClose && msg.id && (
              <IconButton
                onClick={() => removeMessage(msg.id!)}
                sx={{ cursor: "pointer" }}>
                <Close sx={{ width: "20px", height: "20px" }} />
              </IconButton>
            )}

            {/* {isTimed && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: 2,
                  animation: progressWidthAnim,
                  backgroundColor:
                    msg.msgStatus === "SUCCESS"
                      ? theme.palette.success.main
                      : msg.msgStatus === "INFO"
                      ? theme.palette.info.main
                      : theme.palette.error.main,
                }}
              />
            )} */}
          </Paper>
        );
      })}
    </>
  );
};
