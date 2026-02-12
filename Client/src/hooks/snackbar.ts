"use client";

import { useGlobalContext } from "@/app/GlobalContext";
import { IMessage } from "@/types";

export const useSnackbar = () => {
  const { snackBarMsg, setSnackBarMsg } = useGlobalContext();

  interface SBMessage {
    msg?: IMessage;
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
        messages: override ? [newMsg] : [...(prev.messages ?? []), newMsg],
      }));
    }, delay);
  };

  const setSBTimer = () => {
    if (!snackBarMsg.messages || snackBarMsg.messages.length === 0) return;

    const timers = snackBarMsg.messages.map((msg) => {
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

  const removeSBMessage = async (id?: number) => {
    setSnackBarMsg((prev) => {
      const updatedMsgs = id
        ? prev.messages?.filter((m) => m.id !== id) || []
        : [];
      return {
        ...prev,
        messages: updatedMsgs,
      };
    });
  };

  return { setSBMessage, setSBTimer, removeSBMessage };
};
