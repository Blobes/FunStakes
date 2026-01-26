"use client";

import { useAppContext } from "@/app/AppContext";
import { MsgType } from "@/types";

export const useSnackbar = () => {
  const { snackBarMsgs, setSnackBarMsgs } = useAppContext();

  interface SBMessage {
    msg?: MsgType;
    delay?: number;
    override?: boolean;
  }

  const setSBMessage = ({ msg, delay = 0, override = true }: SBMessage) => {
    if (msg !== undefined) {
      setTimeout(() => {
        const newMsg = {
          ...msg,
          id: msg.id ?? Number((Math.random() * 1e6).toFixed(0)),
          type: msg.msgStatus ?? null,
          behavior: msg.behavior ?? "TIMED",
          hasClose: msg.hasClose ?? false,
          cta: msg.cta ?? undefined,
        };
        setSnackBarMsgs((prev) => ({
          ...prev,
          messgages: override ? [newMsg] : [...(prev.messgages ?? []), newMsg],
        }));
      }, delay);
    }
  };

  const setSBTimer = () => {
    if (!snackBarMsgs.messgages || snackBarMsgs.messgages.length === 0) return;

    const timers = snackBarMsgs.messgages.map((msg) => {
      let remaining = msg.duration ?? snackBarMsgs.defaultDur;

      if (msg.behavior === "TIMED") {
        const intervalId = setInterval(() => {
          remaining--;

          if (remaining <= 0 && msg.id) {
            removeSBMessage(msg.id);
            clearInterval(intervalId);
          }
        }, 1000);
        return intervalId;
      }
    });
    // Cleanup
    return () => timers.forEach((id) => clearInterval(id));
  };

  const removeSBMessage = (id: number) => {
    setSnackBarMsgs((prev) => {
      const updatedMsgs = prev.messgages?.filter((m) => m.id !== id) || [];
      return {
        ...prev,
        messgages: updatedMsgs,
      };
    });
  };

  return { setSBMessage, setSBTimer, removeMessage: removeSBMessage };
};
