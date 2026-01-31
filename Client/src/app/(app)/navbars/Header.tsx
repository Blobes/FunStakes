"use client";

import React, { useEffect, useRef, MouseEvent } from "react";
import { AppBar, Stack, IconButton, } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/app/GlobalContext";
import { useController } from "@/hooks/global";
import { DesktopNav, MobileNav } from "./Nav";
import { SearchContainer } from "@/components/Search";
import { UserAvatar } from "@/components/UserAvatar";
import { AnchorLink, AppButton } from "@/components/Buttons";
import { MenuRef } from "@/components/Menus";
import { clientRoutes } from "@/helpers/routes";
import { img } from "@/assets/exported";
import Image from "next/image";
import { Bell } from "lucide-react";
import { zIndexes } from "@/helpers/global";

interface AppHeaderProps {
  scrollRef?: React.RefObject<HTMLElement | null>;
}
export const AppHeader: React.FC<AppHeaderProps> = ({ scrollRef }) => {
  const { loginStatus } = useGlobalContext();
  const { setLastPage, openModal, closeModal, isDesktop, handleWindowResize,
    handleClick, handleScrolling } = useController();
  const theme = useTheme();
  const router = useRouter();
  const isLoggedIn = loginStatus === "AUTHENTICATED";
  const menuRef = useRef<MenuRef>(null);
  const scrollDir = handleScrolling(scrollRef);


  /* ---------------------------------- effects --------------------------------- */
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    openMobileNav()
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  /* -------------------------------- handlers --------------------------------- */

  const handleNotification = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLastPage(clientRoutes.notifications);
    router.push(clientRoutes.notifications.path);
  };

  const openMobileNav = () =>
    openModal({
      header: <UserAvatar style={{ width: "35px", height: "35px" }} />,
      content: <MobileNav />,
      source: "navbar",
      dragToClose: true,
      transition: {
        mobile: { type: "slide", direction: "left" },
      },
      onClose: closeModal,
      style: {
        base: { overlay: { padding: theme.boxSpacing(6) } },
        smallScreen: {
          overlay: { padding: theme.boxSpacing(0) },
          content: { height: "100%", borderRadius: "0px" }
        },
        header: {
          justifyContent: "space-between",
          padding: theme.boxSpacing(5, 8),
        },
      },
    });

  /* ---------------------------------- render ---------------------------------- */
  return (
    <AppBar
      position="sticky"
      component="nav"
      aria-label="Main navigation"
      role="navigation"
      sx={{
        zIndex: zIndexes[500],
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: theme.gap(6),
        backdropFilter: "blur(24px)",
        ...(!isDesktop && {
          transform: scrollDir === "down" ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.3s ease-in-out",
        }),
      }}>

      {/* Notification */}
      {isLoggedIn && !isDesktop && (
        <IconButton
          onClick={handleNotification}
          href={clientRoutes.notifications.path}>
          <Bell />
        </IconButton>
      )}

      {/* Logo */}
      {(!isLoggedIn || isLoggedIn && !isDesktop) && (
        <AnchorLink
          url={clientRoutes.home.path}
          onClick={() => {
            handleClick(clientRoutes.home);
          }}
          style={{ display: "inline-flex" }}
        ><Image
            src={img.logo}
            alt="logo"
            style={{
              width: 34,
              height: 34,
              borderRadius: `${theme.radius.full}`,
            }}
          /></AnchorLink>
      )}

      {/* Search */}
      {(isDesktop && isLoggedIn) && <SearchContainer />}

      {/* Right controls */}
      <Stack direction="row" alignItems="center" spacing={theme.gap(8)}>
        {isLoggedIn && (
          <>
            {isDesktop && <DesktopNav menuRef={menuRef} />}
            <UserAvatar
              toolTipValue="Open menu"
              style={{
                width: "34px", height: "34px",
                [theme.breakpoints.down("md")]: {
                  width: "28px", height: "28px"
                },
              }}
              action={(e) => {
                isDesktop
                  ? menuRef.current?.openMenu(e.currentTarget)
                  : openMobileNav();
              }}
            />
          </>
        )}

        {/* Login Button */}
        {loginStatus === "UNAUTHENTICATED" && (
          <AppButton
            href={clientRoutes.login.path}
            variant="outlined"
            style={{ fontSize: "14px" }}
            onClick={(e: React.MouseEvent) =>
              handleClick(clientRoutes.login, e, { type: "element", savePage: false })
            }>
            Sign in
          </AppButton>
        )}
      </Stack>
    </AppBar >
  );
};
