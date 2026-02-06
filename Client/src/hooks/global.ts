"use client";

import { useGlobalContext } from "@/app/GlobalContext";
import { DrawerContent } from "@/types";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { delay } from "@/helpers/global";
import { checkSignal } from "@/helpers/signal";
import { ModalProps } from "@/components/Modal";

export const useController = () => {
  const theme = useTheme();

  const {
    setDrawerContent,
    drawerContent,
    setModalContent,
    networkStatus,
    setNetworkStatus,
    setSignalCheck,
  } = useGlobalContext();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isOnline = networkStatus === "STABLE";
  const isUnstableNetwork = networkStatus === "UNSTABLE";
  const isOffline = networkStatus === "OFFLINE";

  const openDrawer = (update: DrawerContent) => {
    setDrawerContent((prev) => (prev === update ? prev : update));
  };
  const closeDrawer = async () => {
    await delay(200);
    setDrawerContent(null);
  };

  const openModal = (update: ModalProps) => {
    setModalContent((prev) => (prev === update ? prev : update));
  };
  const closeModal = async () => {
    await delay(200);
    setModalContent(null);
  };

  const handleWindowResize = () => {
    if (isDesktop && drawerContent?.source === "navbar") {
      closeDrawer();
    }
  };

  // Network signal
  const verifySignal = async () => {
    setSignalCheck(true);
    const status = await checkSignal();
    setNetworkStatus(status);
    await delay(300);
    setSignalCheck(false);
  };

  return {
    openDrawer,
    closeDrawer,
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
