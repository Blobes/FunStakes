"use client";

import React, { useEffect, useRef, MouseEvent } from "react";
import { AppBar, Toolbar, Stack, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/app/AppContext";
import { useSharedHooks } from "@/hooks";
import { DesktopWebNav, MobileWebNav } from "./WebNav";
import { DesktopUserNav, MobileUserNav } from "./UserNav";
import { SearchBar } from "@/components/Search";
import { UserAvatar } from "@/components/UserAvatar";
import { AnchorLink, AppButton } from "@/components/Buttons";
import { MenuRef } from "@/components/Menus";
import { clientRoutes } from "@/helpers/info";
import { isOnline } from "@/helpers/others";
import { img } from "@/assets/exported";
import IOfflineAvatar from "@/assets/svgs/offline-avatar.svg";
import Image from "next/image";
import { Bell, Menu } from "lucide-react";

export const Header: React.FC = () => {
  const { loginStatus, modalContent } = useAppContext();
  const { setLastPage, openModal, closeModal, isDesktop, isOnWeb } =
    useSharedHooks();
  const theme = useTheme();
  const router = useRouter();
  const isLoggedIn = loginStatus === "AUTHENTICATED";
  const menuRef = useRef<MenuRef>(null);
  const pathname = usePathname();
  const isOnWebRoute = isOnWeb(pathname);

  /* ---------------------------------- effects --------------------------------- */
  useEffect(() => {
    const handleResize = () => {
      if (isDesktop && modalContent?.source === "navbar") {
        closeModal();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* -------------------------------- handlers --------------------------------- */
  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLastPage(clientRoutes.about);
    router.push(clientRoutes.about.path);
  };

  const handleNotification = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLastPage(clientRoutes.notifications);
    router.push(clientRoutes.notifications.path);
  };

  const openMobileWebNav = () =>
    openModal({
      content: (
        <MobileWebNav
          style={{
            gap: theme.gap(4),
          }}
        />
      ),
      source: "navbar",
      entryDir: "LEFT",
      onClose: () => closeModal(),
      style: {
        content: { otherStyles: { height: "100%" } },
      },
    });

  const openMobileUserNav = () =>
    openModal({
      header: <UserAvatar style={{ width: "35px", height: "35px" }} />,
      content: <MobileUserNav />,
      source: "navbar",
      entryDir: "RIGHT",
      onClose: closeModal,
      style: {
        content: {
          otherStyles: {
            height: "100%",
            backgroundColor: theme.palette.gray[0],
          },
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
      sx={{ zIndex: 500 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.gap(6),
          //  padding: theme.boxSpacing(4, 4),
          borderBottom: `1px solid ${theme.palette.gray.trans[1]}`,
        }}>
        {/* Mobile hamburger (logged out only) */}
        {isOnWebRoute && !isDesktop && (
          <IconButton onClick={openMobileWebNav} aria-label="Open menu">
            <Menu />
          </IconButton>
        )}

        {!isOnWebRoute && isLoggedIn && !isDesktop && (
          <IconButton
            onClick={handleNotification}
            href={clientRoutes.notifications.path}>
            <Bell />
          </IconButton>
        )}

        {/* Logo */}
        <AnchorLink
          url={clientRoutes.about.path}
          onClick={handleLogoClick}
          style={{ display: "inline-flex" }}
          icon={
            <Image
              src={img.logo}
              alt="logo"
              style={{
                width: 34,
                height: 34,
                borderRadius: `${theme.radius.full}`,
              }}
            />
          }
        />

        {/* Search */}
        {isLoggedIn && <SearchBar />}

        {/* Right controls */}
        <Stack direction="row" alignItems="center" spacing={theme.gap(8)}>
          {isOnWebRoute && isDesktop && (
            <DesktopWebNav
              style={{
                display: { xs: "none", md: "flex", flexDirection: "row" },
                gap: theme.gap(4),
              }}
            />
          )}
          {/* <ThemeMode /> */}

          {isOnline() && isLoggedIn && (
            <>
              {isDesktop && <DesktopUserNav menuRef={menuRef} />}
              <UserAvatar
                toolTipValue={isOnWebRoute ? "Back to timeline" : "Open menu"}
                style={{ width: "34px", height: "34px" }}
                action={(e) => {
                  if (isOnWebRoute) router.replace(clientRoutes.about.path);
                  else
                    isDesktop
                      ? menuRef.current?.openMenu(e.currentTarget)
                      : openMobileUserNav();
                }}
              />
            </>
          )}
          {(!isOnline() || loginStatus === "UNKNOWN") && (
            <IOfflineAvatar style={{ width: "34px", height: "34px" }} />
          )}

          {loginStatus === "UNAUTHENTICATED" && (
            <AppButton
              href={clientRoutes.login.path}
              style={{ fontSize: "14px" }}
              onClick={(e) => {
                e.preventDefault();
                router.push(clientRoutes.login.path);
              }}>
              Login
            </AppButton>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
