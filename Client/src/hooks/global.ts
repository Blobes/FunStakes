"use client";

import { useGlobalContext } from "@/app/GlobalContext";
import { ModalContent, Page } from "@/types";
import { useMediaQuery } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { flaggedRoutes } from "../helpers/routes";
import { useRouter } from "next/navigation";
import { delay } from "@/helpers/global";
import { checkSignal } from "@/helpers/signal";

export const useController = () => {
  const {
    setPage,
    setModalContent,
    modalContent,
    networkStatus,
    setNetworkStatus,
    setGlobalLoading,
  } = useGlobalContext();
  const theme = useTheme();
  const router = useRouter();

  const setLastPage = ({ title, path }: Page) => {
    const pageInfo = { title: title, path: path };
    setPage(pageInfo);
    localStorage.setItem("saved_page", JSON.stringify(pageInfo));
  };

  const openModal = (update: ModalContent) => {
    setModalContent((prev) => (prev === update ? prev : update));
  };

  const closeModal = async () => {
    await delay(200);
    setModalContent(null);
  };

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isOnWeb = (path: string) => flaggedRoutes.web.includes(path);
  const isOnAuth = (path: string) => flaggedRoutes.auth.includes(path);

  const handleWindowResize = () => {
    if (isDesktop && modalContent?.source === "navbar") {
      closeModal();
    }
  };

  interface ClickOptions {
    type?: "element" | "link";
    savePage?: boolean;
  }
  const handleClick = (
    page: Page,
    e?: React.MouseEvent,
    option: ClickOptions = {},
  ) => {
    const type = option.type ?? "link";
    const savePage = option.savePage ?? true;

    if (savePage) setLastPage(page);
    if (modalContent) closeModal();
    if (type === "element") {
      e?.preventDefault();
      router.push(page.path);
    }
  };

  const handleScrolling = (ref?: React.RefObject<HTMLElement | null>) => {
    const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
    const [prevOffset, setPrevOffset] = useState(0);

    useEffect(() => {
      const scrollTarget = ref?.current || window;

      const handleScroll = () => {
        const currentOffset =
          scrollTarget instanceof Window
            ? window.scrollY
            : scrollTarget.scrollTop;

        // 1. Determine direction
        const direction = currentOffset > prevOffset ? "down" : "up";

        // 2. Optimization: Only update state if direction changed
        // and we've scrolled more than a small threshold (e.g. 10px)
        if (
          direction !== scrollDir &&
          Math.abs(currentOffset - prevOffset) > 16
        ) {
          setScrollDir(direction);
        }
        setPrevOffset(currentOffset);
      };

      scrollTarget.addEventListener("scroll", handleScroll);
      return () => scrollTarget.removeEventListener("scroll", handleScroll);
    }, [scrollDir, prevOffset]);

    return scrollDir;
  };

  // Network signal
  const verifySignal = async () => {
    setGlobalLoading(true);
    const status = await checkSignal();
    setNetworkStatus(status);
    await delay(1000 * 5);
    setGlobalLoading(false);
  };
  const isOnline = networkStatus === "STABLE";
  const isUnstableNetwork = networkStatus === "UNSTABLE";
  const isOffline = networkStatus === "OFFLINE";

  return {
    setLastPage,
    openModal,
    closeModal,
    isDesktop,
    isMobile,
    isOnWeb,
    isOnAuth,
    handleWindowResize,
    handleClick,
    handleScrolling,
    verifySignal,
    isOnline,
    isUnstableNetwork,
    isOffline,
  };
};
