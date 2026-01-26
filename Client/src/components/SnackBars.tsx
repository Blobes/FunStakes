"use client";

import { IconButton, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@mui/icons-material";
import { SnackBarMsg } from "@/types";
import { AppButton } from "./Buttons";
import { Info, CircleCheck, CircleAlert } from "lucide-react";
import { useEffect } from "react";
import { useAppContext } from "@/app/AppContext";
import { useSnackbar } from "@/hooks/snackbarHooks";
import { GroupTransition, Transition } from "./Transition";

interface SnackbarProps {
  snackBarMsg: SnackBarMsg;
}

export const SnackBars = ({ snackBarMsg }: SnackbarProps) => {
  const theme = useTheme();
  const { setSBTimer, removeMessage } = useSnackbar();
  const { setSnackBarMsg } = useAppContext();

  if (!snackBarMsg.messgages || snackBarMsg.messgages.length === 0) {
    return null
  };

  useEffect(() => {
    setSBTimer();
  }, [setSnackBarMsg]);

  return (
    <Stack
      sx={{
        position: "fixed",
        ...(snackBarMsg.dir === "up" ? { bottom: "10px" } : { top: "10px" }),
        right: "10px",
        zIndex: 1000,
        width: "94%",
        maxWidth: "400px",
        gap: theme.gap(2),
      }}
    >
      <GroupTransition>
        {snackBarMsg.messgages.map((msg) => {
          return (
            <Transition
              key={msg.id}
              type="slide"
              direction={snackBarMsg.dir}
              timeout={300}
            >
              <Paper
                variant="elevation"
                sx={{
                  width: "100%",
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

                  {msg.content && (
                    <Typography variant="body2" sx={{ width: "100%" }}>{msg.content}
                      {msg.cta && (
                        <AppButton
                          variant="text"
                          onClick={msg.cta.action}
                          style={{ marginLeft: theme.boxSpacing(2), color: theme.palette.primary.light }}>
                          {msg.cta.label}
                        </AppButton>
                      )}</Typography>
                  )}
                </Stack>

                {/* Close element */}
                {msg.hasClose && msg.id && (
                  <IconButton
                    onClick={() => removeMessage(msg.id!)}
                    sx={{ cursor: "pointer" }}>
                    <Close sx={{ width: "20px", height: "20px" }} />
                  </IconButton>
                )}
              </Paper>
            </Transition>
          );
        })}
      </GroupTransition>
    </Stack>
  );
};
