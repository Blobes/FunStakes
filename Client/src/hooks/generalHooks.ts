"use client";

import { useAppContext } from "@/app/AppContext";
import { ModalContent, SavedPage } from "@/types";
import { useMediaQuery } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { flaggedRoutes } from "../helpers/info";
import { useRouter } from "next/navigation";

export const useController = () => {
  const { setPage, setModalContent, modalContent } = useAppContext();
  const theme = useTheme();
  const router = useRouter();

  const setLastPage = ({ title, path }: SavedPage) => {
    const pageInfo = { title: title, path: path };
    setPage(pageInfo);
    localStorage.setItem("saved_page", JSON.stringify(pageInfo));
  };

  const openModal = (update: ModalContent) => {
    setModalContent((prev) => (prev === update ? prev : update));
  };

  const closeModal = () => {
    setTimeout(() => setModalContent(null), 200);
  };

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const isOnWeb = (path: string) => flaggedRoutes.web.includes(path);
  const isOnAuth = (path: string) => flaggedRoutes.auth.includes(path);

  const handleWindowResize = () => {
    if (isDesktop && modalContent?.source === "navbar") {
      closeModal();
    }
  };

  const handleLinkClick = (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    page: SavedPage,
    savePage: boolean = true,
  ) => {
    e.preventDefault();
    if (savePage) setLastPage(page);
    router.push(page.path);
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

  return {
    setLastPage,
    openModal,
    closeModal,
    isDesktop,
    isOnWeb,
    isOnAuth,
    handleWindowResize,
    handleLinkClick,
    handleScrolling,
  };
};
