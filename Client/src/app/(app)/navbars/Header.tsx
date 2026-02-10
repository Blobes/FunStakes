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
import { usePage } from "@/hooks/page";
import { usePageScroll } from "@/hooks/pageScroll";

interface AppHeaderProps {
  scrollRef?: React.RefObject<HTMLElement | null>;
}
export const AppHeader: React.FC<AppHeaderProps> = ({ scrollRef }) => {
  const { authStatus } = useGlobalContext();
  const { openDrawer, closeDrawer, isDesktop,
    handleWindowResize } = useController();
  const { setLastPage, navigateTo } = usePage();
  const { handlePageScroll } = usePageScroll();
  const theme = useTheme();
  const router = useRouter();
  const isLoggedIn = authStatus === "AUTHENTICATED";
  const menuRef = useRef<MenuRef>(null);
  const scrollDir = handlePageScroll(scrollRef);


  /* ---------------------------------- effects --------------------------------- */
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    // openMobileNav()
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  /* -------------------------------- handlers --------------------------------- */

  const handleNotification = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLastPage(clientRoutes.notifications);
    router.push(clientRoutes.notifications.path);
  };

  const openMobileNav = () =>
    openDrawer({
      header: <UserAvatar style={{ width: "35px", height: "35px" }} />,
      content: <MobileNav />,
      source: "navbar",
      dragToClose: true,
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
        gap: theme.gap(4),
        backdropFilter: "blur(24px)",
        ...(!isDesktop && {
          transform: scrollDir === "down" ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.3s ease-in-out",
        }),
      }}>

      {/* Logo */}
      <AnchorLink
        url={clientRoutes.home.path}
        onClick={() => {
          navigateTo(clientRoutes.home);
        }}
        style={{ display: "inline-flex" }}>
        <Image
          src={img.logo}
          alt="logo"
          style={{
            width: 34,
            height: 34,
            borderRadius: `${theme.radius.full}`,
          }} />
      </AnchorLink>


      {/* Search */}
      {(isDesktop && isLoggedIn) && <SearchContainer />}

      {/* Right controls */}
      <Stack direction="row" alignItems="center" spacing={theme.gap(6)}>
        {isLoggedIn && (
          <>
            {/* Notification */}
            <IconButton
              onClick={handleNotification}
              href={clientRoutes.notifications.path}
              style={{
                width: 36,
                height: 36,
                padding: theme.boxSpacing(4),
                border: `1px solid ${theme.palette.gray.trans[1]}`
              }}>
              <Bell style={{
                width: "100%", stroke: theme.palette.primary.dark
              }} />
            </IconButton>

            {/* User Avatar  */}
            {isDesktop && <DesktopNav menuRef={menuRef} />}
            <UserAvatar
              toolTipValue="Open menu"
              style={{
                width: "34px", height: "34px",
                marginLeft: "unset!important",
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
        {authStatus === "UNAUTHENTICATED" && (
          <AppButton
            href={clientRoutes.login.path}
            variant="outlined"
            style={{ fontSize: "14px" }}
            onClick={() =>
              navigateTo(clientRoutes.login,
                { type: "element", savePage: false, loadPage: true })
            }>
            Sign in
          </AppButton>
        )}
      </Stack>
    </AppBar >
  );
};
