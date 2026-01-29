"use client";

import { useAppContext } from "@/app/AppContext";
import { MsgType } from "@/types";

export const useSnackbar = () => {
  const { snackBarMsg, setSnackBarMsg } = useAppContext();

  interface SBMessage {
    msg?: MsgType;
    delay?: number;
    override?: boolean;
  }
  const setSBMessage = ({ msg, delay = 0, override = true }: SBMessage) => {
    if (msg === undefined) return;
    const newMsg = {
      ...msg,
      id: msg.id ?? Number((Math.random() * 1e6).toFixed(0)),
      type: msg.msgStatus ?? null,
      behavior: msg.behavior ?? "TIMED",
      hasClose: msg.hasClose ?? false,
      cta: msg.cta ?? undefined,
    };
    setTimeout(() => {
      setSnackBarMsg((prev) => ({
        ...prev,
        messgages: override ? [newMsg] : [...(prev.messgages ?? []), newMsg],
      }));
    }, delay);
  };

  const setSBTimer = () => {
    if (!snackBarMsg.messgages || snackBarMsg.messgages.length === 0) return;

    const timers = snackBarMsg.messgages.map((msg) => {
      let remaining = msg.duration ?? snackBarMsg.defaultDur;
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

  const removeSBMessage = async (id: number) => {
    setSnackBarMsg((prev) => {
      const updatedMsgs = prev.messgages?.filter((m) => m.id !== id) || [];
      return {
        ...prev,
        messgages: updatedMsgs,
      };
    });
  };

  return { setSBMessage, setSBTimer, removeMessage: removeSBMessage };
};
