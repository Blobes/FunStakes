"use client";

import { useGlobalContext } from "@/app/GlobalContext";
import { ModalContent } from "@/types";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { delay } from "@/helpers/global";
import { checkSignal } from "@/helpers/signal";

export const useController = () => {
  const {
    setModalContent,
    modalContent,
    networkStatus,
    setNetworkStatus,
    setSignalCheck,
  } = useGlobalContext();
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isOnline = networkStatus === "STABLE";
  const isUnstableNetwork = networkStatus === "UNSTABLE";
  const isOffline = networkStatus === "OFFLINE";

  const openModal = (update: ModalContent) => {
    setModalContent((prev) => (prev === update ? prev : update));
  };

  const closeModal = async () => {
    await delay(200);
    setModalContent(null);
  };

  const handleWindowResize = () => {
    if (isDesktop && modalContent?.source === "navbar") {
      closeModal();
    }
  };

  // Network signal
  const verifySignal = async () => {
    setSignalCheck(true);
    const status = await checkSignal();
    setNetworkStatus(status);
    await delay(500);
    setSignalCheck(false);
  };

  return {
    openModal,
    closeModal,
    isDesktop,
    isMobile,
    handleWindowResize,
    verifySignal,
    isOnline,
    isUnstableNetwork,
    isOffline,
  };
};
